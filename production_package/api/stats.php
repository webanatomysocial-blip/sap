<?php
// api/stats.php
require_once 'db.php';

header('Content-Type: application/json');

try {
    // 1. Total Blogs
    $blogsCount = $pdo->query("SELECT COUNT(*) FROM blogs")->fetchColumn();

    // 2. Total Contributors (Applications)
    $contributorsCount = $pdo->query("SELECT COUNT(*) FROM contributors")->fetchColumn();

    // 3. Pending Items (Comments or Applications)
    $pendingComments = $pdo->query("SELECT COUNT(*) FROM comments WHERE status = 'pending'")->fetchColumn();
    $pendingApps = $pdo->query("SELECT COUNT(*) FROM contributors WHERE status = 'pending'")->fetchColumn();

    // 4. Total Views (Aggregated from blogs table view_count)
    $totalViews = $pdo->query("SELECT SUM(view_count) FROM blogs")->fetchColumn() ?: 0;

    echo json_encode([
        'blogs' => (int)$blogsCount,
        'contributors' => (int)$contributorsCount,
        'pending_reviews' => (int)($pendingComments + $pendingApps),
        'total_views' => (int)$totalViews
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
