<?php
require_once 'api/db.php';
$stmt = $pdo->query("SELECT SUM(views) as total FROM blogs");
$row = $stmt->fetch();
echo "TOTAL VIEWS: " . ($row['total'] ?? 0) . "\n";

$tables = ['contributors', 'members', 'blogs', 'comments'];
foreach ($tables as $table) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as c FROM $table");
        $row = $stmt->fetch();
        echo "$table COUNT: " . $row['c'] . "\n";
    } catch (Exception $e) {
        echo "Error on $table: " . $e->getMessage() . "\n";
    }
}
