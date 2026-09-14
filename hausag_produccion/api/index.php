<?php
header('Content-Type: application/json; charset=utf-8');

// Configuración CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';
$JWT_SECRET = 'hausag_super_secret_key_2026';

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

function generate_jwt($payload, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode(json_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64url_encode($signature);
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verify_jwt($jwt, $secret) {
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) != 3) return false;
    $header = base64url_decode($tokenParts[0]);
    $payload = base64url_decode($tokenParts[1]);
    $signature_provided = $tokenParts[2];
    
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode($payload);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64url_encode($signature);
    
    if ($base64UrlSignature === $signature_provided) {
        $data = json_decode($payload, true);
        if (isset($data['exp']) && $data['exp'] < time()) return false;
        return $data;
    }
    return false;
}

function authenticate() {
    global $JWT_SECRET;
    $headers = apache_request_headers();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');
    
    if (!$authHeader) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        exit();
    }
    
    $parts = explode(' ', $authHeader);
    $token = count($parts) > 1 ? $parts[1] : $authHeader;
    
    $decoded = verify_jwt($token, $JWT_SECRET);
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit();
    }
    
    return $decoded['userId'];
}

$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true);

if (strpos($requestUri, '/auth/register') !== false && $method === 'POST') {
    $first_name = $body['first_name'] ?? '';
    $last_name = $body['last_name'] ?? '';
    $email = $body['email'] ?? '';
    $dni = $body['dni'] ?? '';
    $password = $body['password'] ?? '';
    
    // Check dups
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'El email ya está registrado']);
        exit();
    }
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE dni = :dni");
    $stmt->execute([':dni' => $dni]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'El DNI ya está registrado']);
        exit();
    }
    
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, dni, password_hash) VALUES (:first_name, :last_name, :email, :dni, :password_hash)");
    $stmt->execute([
        ':first_name' => $first_name,
        ':last_name' => $last_name,
        ':email' => $email,
        ':dni' => $dni,
        ':password_hash' => $hash
    ]);
    
    $userId = $pdo->lastInsertId();
    $token = generate_jwt(['userId' => $userId, 'exp' => time() + 7*24*3600], $JWT_SECRET);
    
    echo json_encode(['token' => $token, 'user' => ['id' => $userId, 'first_name' => $first_name, 'last_name' => $last_name, 'email' => $email]]);
    exit();
}

if (strpos($requestUri, '/auth/login') !== false && $method === 'POST') {
    $email = $body['email'] ?? '';
    $password = $body['password'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit();
    }
    
    $token = generate_jwt(['userId' => $user['id'], 'exp' => time() + 7*24*3600], $JWT_SECRET);
    echo json_encode(['token' => $token, 'user' => [
        'id' => $user['id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email']
    ]]);
    exit();
}

if (strpos($requestUri, '/user/profile') !== false) {
    $userId = authenticate();
    
    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, description FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $stmt = $pdo->prepare("SELECT * FROM user_cards WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        $user['cards'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($user);
        exit();
    }
    
    if ($method === 'PUT') {
        $first_name = $body['first_name'] ?? null;
        $last_name = $body['last_name'] ?? null;
        $description = $body['description'] ?? null;
        $email = $body['email'] ?? null;
        $current_password = $body['current_password'] ?? null;
        $new_password = $body['new_password'] ?? null;
        
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($email && $email !== $user['email']) {
            $stmtEmail = $pdo->prepare("SELECT id FROM users WHERE email = :email");
            $stmtEmail->execute([':email' => $email]);
            if ($stmtEmail->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'El email ya está en uso']);
                exit();
            }
        }
        
        if ($current_password && $new_password) {
            if (!password_verify($current_password, $user['password_hash'])) {
                http_response_code(400);
                echo json_encode(['error' => 'La contraseña actual es incorrecta']);
                exit();
            }
            $user['password_hash'] = password_hash($new_password, PASSWORD_BCRYPT);
        }
        
        $updates = [];
        $params = [':id' => $userId];
        
        if ($first_name !== null) { $updates[] = "first_name = :first_name"; $params[':first_name'] = $first_name; }
        if ($last_name !== null) { $updates[] = "last_name = :last_name"; $params[':last_name'] = $last_name; }
        if ($description !== null) { $updates[] = "description = :description"; $params[':description'] = $description; }
        if ($email !== null) { $updates[] = "email = :email"; $params[':email'] = $email; }
        if (isset($user['password_hash'])) { $updates[] = "password_hash = :password_hash"; $params[':password_hash'] = $user['password_hash']; }
        
        if (count($updates) > 0) {
            $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
        
        echo json_encode(['success' => true]);
        exit();
    }
}

if (strpos($requestUri, '/user/cards') !== false) {
    $userId = authenticate();
    
    if ($method === 'POST') {
        $card_number = $body['card_number'] ?? '';
        $name_on_card = $body['name_on_card'] ?? '';
        
        $card_last_4 = substr($card_number, -4);
        $firstDigit = substr($card_number, 0, 1);
        $card_brand = 'Desconocida';
        if ($firstDigit === '4') $card_brand = 'Visa';
        else if ($firstDigit === '5') $card_brand = 'Mastercard';
        else if ($firstDigit === '3') $card_brand = 'Amex';
        
        $stmt = $pdo->prepare("INSERT INTO user_cards (user_id, card_last_4, card_brand, name_on_card) VALUES (:user_id, :card_last_4, :card_brand, :name_on_card)");
        $stmt->execute([
            ':user_id' => $userId,
            ':card_last_4' => $card_last_4,
            ':card_brand' => $card_brand,
            ':name_on_card' => $name_on_card
        ]);
        
        $cardId = $pdo->lastInsertId();
        
        echo json_encode([
            'id' => $cardId,
            'user_id' => $userId,
            'card_last_4' => $card_last_4,
            'card_brand' => $card_brand,
            'name_on_card' => $name_on_card
        ]);
        exit();
    }
    
    if ($method === 'DELETE') {
        preg_match('/\/user\/cards\/(\d+)/', $requestUri, $matches);
        if (isset($matches[1])) {
            $cardId = $matches[1];
            $stmt = $pdo->prepare("DELETE FROM user_cards WHERE id = :id AND user_id = :user_id");
            $stmt->execute([':id' => $cardId, ':user_id' => $userId]);
            echo json_encode(['success' => true]);
            exit();
        }
    }
}

// Fallback for not found
http_response_code(404);
echo json_encode(['error' => 'Route not found in PHP backend: ' . $requestUri]);
