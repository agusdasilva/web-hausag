<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Aumentar el tiempo mÃ¡ximo de ejecuciÃ³n a 120 segundos para evitar timeouts de cURL
set_time_limit(120);

// Clave API de Gemini â€” leÃ­da desde archivo de configuraciÃ³n (NO en Git)
$configFile$configFile = __DIR__ . '/../config.php';
if (file_exists($configFile)) {
    require_once $configFile;
}
$apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : getenv('GEMINI_API_KEY');
$geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" . $apiKey;

$systemInstruction = "Eres un asistente virtual de ventas para 'El Ãguila Sanitarios' / 'Hausag'.
Es una empresa con sede en Mar del Plata que ofrece soluciones integrales en instalaciones sanitarias, gas, calefacciÃ³n e industriales desde 1995.

Tus reglas principales son:
1. Responde siempre de forma muy amable, profesional y concisa (ideal para leer rÃ¡pido en un pequeÃ±o chat web).
2. Si el cliente pregunta por un presupuesto especÃ­fico o disponibilidad de un producto (como caÃ±os, griferÃ­as, calderas), dile amablemente que para dar un precio exacto o verificar stock necesitamos que nos envÃ­e su consulta, o bien que un vendedor especializado se pondrÃ¡ en contacto pronto.
3. Si la pregunta es muy tÃ©cnica sobre instalaciones, pide que deje su consulta detallada y ofrÃ©cele que un tÃ©cnico lo asesore.
4. El horario de atenciÃ³n comercial es de Lunes a Viernes de 8:00 a 16:00 hs. (Si preguntan, indÃ­calo).
5. Como estÃ¡s integrado directamente en la web, si te preguntan por un producto puedes sugerir que naveguen por el catÃ¡logo online.
6. IMPORTANTE: Escribe TODAS tus respuestas en TEXTO PLANO. NO uses formato Markdown (no uses asteriscos para negritas ** ni cursivas *, no uses listas con viÃ±etas de Markdown).

AtiÃ©ndelo rÃ¡pido y mantÃ©n un tono servicial.";

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

if (!isset($input['history']) || !is_array($input['history'])) {
    http_response_code(400);
    echo json_encode(["error" => "No history provided"]);
    exit();
}

$contents = $input['history'];

$payload = [
    "system_instruction" => [
        "parts" => [
            ["text" => $systemInstruction]
        ]
    ],
    "contents" => $contents,
    "generationConfig" => [
        "temperature" => 0.7,
        "maxOutputTokens" => 800
    ]
];

$ch = curl_init($geminiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_USERAGENT, 'HausagBot/1.0 (Windows)');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => "CURL Error: " . curl_error($ch)]);
} else {
    $decoded = json_decode($response, true);

    // Extraer solo el texto limpio y devolver en formato estÃ¡ndar que Angular espera
    if ($decoded && isset($decoded['candidates'][0]['content']['parts'][0]['text'])) {
        $text = $decoded['candidates'][0]['content']['parts'][0]['text'];
        http_response_code(200);
        echo json_encode([
            "candidates" => [[
                "content" => [
                    "parts" => [["text" => $text]],
                    "role" => "model"
                ],
                "finishReason" => "STOP",
                "index" => 0
            ]]
        ]);
    } else {
        // Si viene un error de la API de Google, lo pasamos tal cual
        http_response_code($httpCode);
        echo $response;
    }
}
curl_close($ch);
?>

