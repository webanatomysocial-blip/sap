<?php
require_once 'api/db.php';
$stmt = $pdo->query("PRAGMA table_info(blogs)");
$cols = [];
foreach($stmt->fetchAll() as $row) {
    $cols[] = $row['name'];
}
sort($cols);
echo implode(", ", $cols);
echo "\nTotal Columns: " . count($cols);
