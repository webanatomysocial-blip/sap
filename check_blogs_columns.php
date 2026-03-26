<?php
require_once 'api/db.php';
$stmt = $pdo->query("PRAGMA table_info(blogs)");
foreach($stmt->fetchAll() as $row) {
    echo $row['name'] . "\n";
}
