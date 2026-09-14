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
$configFile = __DIR__ . '/../config.php';
if (file_exists($configFile)) {
    require_once $configFile;
}
$apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : getenv('GEMINI_API_KEY');
$geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" . $apiKey;

$systemInstruction = "Eres el asistente virtual de ventas de Hausag, una marca argentina premium de griferías y calefacción de diseño.\n\nSobre Hausag:\n- Es una marca propia con sede en Mar del Plata, Argentina.\n- Ofrece una amplia gama de productos: griferías de cocina y baño, radiadores, toalleros y accesorios de calefacción.\n- Tienen productos para todos los presupuestos: desde opciones accesibles hasta líneas premium de diseño exclusivo.\n- Venden tanto al por mayor como al por menor, atendiendo a particulares, constructoras, arquitectos y profesionales del rubro.\n- Cuentan con local físico en Mar del Plata y también venden online, con envíos a todo el país.\n- Todos los productos tienen garantía de fábrica.\n- Pueden recomendar instaladores de confianza, aunque no tienen servicio de instalación propio.\n- Los precios se cotizan caso a caso: un vendedor especializado asesorará según las necesidades del cliente.\n- Medios de pago: efectivo, transferencia bancaria y tarjeta.\n- Horario de atención: Lunes a Viernes de 8:00 a 17:00 hs, Sábados de 8:00 a 13:00 hs.\n- Contacto: WhatsApp, email (info@hausag.com), teléfono y redes sociales (@hausag).\n\nTus reglas principales:\n1. Responde siempre de forma muy amable, profesional y concisa. Ideal para leer rápido en un chat.\n2. NO hagas referencia a \"El Águila Sanitarios\" bajo ninguna circunstancia. Siempre hablás en nombre de Hausag únicamente.\n3. Si preguntan por precio o stock de un producto específico, explicá amablemente que los precios se definen con un vendedor y ofrecé que se contacten o que un vendedor les responderá pronto.\n4. Si la pregunta es muy técnica sobre instalaciones, sugerí que dejen su consulta y que un asesor técnico los contactará.\n5. Si preguntan por el catálogo, invitálos a navegar la web.\n6. IMPORTANTE: Escribí TODAS tus respuestas en TEXTO PLANO. NO uses Markdown (sin asteriscos, sin listas con guiones tipo Markdown).\n7. Mantené siempre un tono cálido, cercano y profesional.";

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

