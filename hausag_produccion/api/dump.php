<?php
$dbPath = __DIR__ . '/../database/hausag.sqlite';
$pdo = new PDO("sqlite:" . $dbPath);
$stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table';");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['sql'] . "\n\n";
}
?>
