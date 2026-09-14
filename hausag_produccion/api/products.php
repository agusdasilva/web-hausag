<?php
// products.php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir el archivo de conexión a la base de datos
require_once __DIR__ . '/db.php';

try {
    // Si se pasa un parámetro 'id' en la URL (ej. products.php?id=1)
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = $_GET['id'];
        
        $stmt = $pdo->prepare("SELECT * FROM Products WHERE id = :id LIMIT 1");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $product = $stmt->fetch();
        
        if ($product) {
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Producto no encontrado"]);
        }
        exit();
    }
    
    // Si NO se pasó un ID, obtenemos todos los productos (con filtros opcionales)
    $whereClauses = [];
    $params = [];
    
    if (isset($_GET['category']) && !empty($_GET['category'])) {
        $whereClauses[] = "category = :category";
        $params[':category'] = $_GET['category'];
    }
    
    if (isset($_GET['color']) && !empty($_GET['color'])) {
        $whereClauses[] = "color = :color";
        $params[':color'] = $_GET['color'];
    }
    
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $whereClauses[] = "title LIKE :search";
        $params[':search'] = '%' . $_GET['search'] . '%';
    }
    
    $query = "SELECT * FROM Products";
    
    if (count($whereClauses) > 0) {
        $query .= " WHERE " . implode(" AND ", $whereClauses);
    }
    
    $stmt = $pdo->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $products = $stmt->fetchAll();
    
    echo json_encode($products);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
