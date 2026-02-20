<?php
// api/debug_data.php
require_once 'db.php';
header('Content-Type: application/json');

try {
    $response = [];

    // Inspect Blogs Table
    $stmt = $pdo->query("SELECT * FROM blogs LIMIT 1");
    $response['sample_blog'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Inspect Contributors Table
    $stmt = $pdo->query("SELECT * FROM contributors LIMIT 1");
    $response['sample_contributor'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Check Row Counts
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM blogs");
    $response['blog_count'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM contributors");
    $response['contributor_count'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
