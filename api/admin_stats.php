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

    // Total Approved Members (Accepted ones)
    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM members WHERE status = 'approved'");
    $approved_members = (int)$stmt->fetchColumn();

    // Pending Members (For badges)
    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM members WHERE status = 'pending'");
    $pending_members = (int)$stmt->fetchColumn();

    echo json_encode([
        'contributors'         => $contributors,
        'pending_contributors' => $pending_contributors,
        'pending_reviews'      => $pending_reviews,
        'pending_comments'     => $pending_comments,
        'blogs'                => $total_blogs,
        'total_views'          => $total_views,
        'approved_members'     => $approved_members,
        'pending_members'      => $pending_members,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
