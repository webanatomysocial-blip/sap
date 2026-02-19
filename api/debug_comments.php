<?php
require_once 'db.php';
header('Content-Type: application/json');

try {
    $response = [];

    // Check if table exists
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='comments'");
    $response['table_exists'] = $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;

    if ($response['table_exists']) {
        // Get Schema
        $stmt = $pdo->query("PRAGMA table_info(comments)");
        $response['schema'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get Row Count
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM comments");
        $response['count'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Get Sample Data
        $stmt = $pdo->query("SELECT * FROM comments LIMIT 5");
        $response['sample_data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
