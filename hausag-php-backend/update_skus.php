<?php
$dbPath = '../hausag-php-backend/database/hausag.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Update SKUs
$stmt1 = $pdo->prepare("UPDATE products SET sku = '067254' WHERE sku = 'HAUS-1023'");
$stmt1->execute();

$stmt2 = $pdo->prepare("UPDATE products SET sku = '067251' WHERE sku = 'HAUS-1022'");
$stmt2->execute();

// Excel says 32696, let's prefix with 0 to match 067xxx
$stmt3 = $pdo->prepare("UPDATE products SET sku = '032696' WHERE sku = '067300'");
$stmt3->execute();

echo "Updated SKUs successfully.";
?>
