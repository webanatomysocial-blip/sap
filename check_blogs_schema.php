<?php
require_once 'api/db.php';
$stmt = $pdo->query("PRAGMA table_info(blogs)");
print_r($stmt->fetchAll());
