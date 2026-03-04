<?php
// api/get_categories.php
require_once 'db.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

try {
    $stmt = $pdo->prepare("SELECT DISTINCT category FROM blogs WHERE status IN ('published', 'approved') AND date <= ? AND category IS NOT NULL AND category != '' ORDER BY category ASC");
    $stmt->execute([gmdate('Y-m-d H:i:s')]);
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode(['status' => 'success', 'categories' => $categories]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
