<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT COUNT(*) as active_contributors FROM contributor_applications WHERE status = 'approved'");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $count = $row ? $row['active_contributors'] : 0;
    
    echo json_encode(["active_contributors" => $count]);
} catch (PDOException $e) {
    echo json_encode(["active_contributors" => 0]); // Fallback safely
}
?>
