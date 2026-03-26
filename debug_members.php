<?php
require_once 'api/db.php';
$stmt = $pdo->query("SELECT email, status FROM members");
$all = $stmt->fetchAll();
header('Content-Type: text/plain');
print_r($all);
