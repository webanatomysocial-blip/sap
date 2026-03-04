<?php
/**
 * api/admin_stats.php
 * GET /api/admin/stats
 * Returns dashboard counts for admin panel.
 *
 * Metrics: total_contributors, pending_reviews (blogs), pending_comments, total_blogs, total_views
 */
require_once 'db.php';
require_once 'auth_check.php';
require_once 'permission_check.php';
requireAdmin();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // Total approved contributors
    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM contributors WHERE status = 'approved'");
    $contributors = (int)$stmt->fetchColumn();

    // Pending contributors
    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM contributors WHERE status = 'pending'");
    $pending_contributors = (int)$stmt->fetchColumn();

    // Pending blog reviews (submitted, not yet approved/rejected)
    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM blogs WHERE submission_status IN ('submitted', 'edited')");
    $pending_reviews = (int)$stmt->fetchColumn();

    // Pending comments
    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM comments WHERE status = 'pending'");
    $pending_comments = (int)$stmt->fetchColumn();

    // Total blog posts
    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM blogs");
    $total_blogs = (int)$stmt->fetchColumn();

    // Total views across all blogs
    $stmt = $pdo->query("SELECT COALESCE(SUM(view_count), 0) AS v FROM blogs");
    $total_views = (int)$stmt->fetchColumn();

    echo json_encode([
        'contributors'         => $contributors,
        'pending_contributors' => $pending_contributors,
        'pending_reviews'      => $pending_reviews,
        'pending_comments'     => $pending_comments,
        'blogs'                => $total_blogs,
        'total_views'          => $total_views,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
