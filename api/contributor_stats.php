<?php
/**
 * api/contributor_stats.php
 * GET /api/contributor/stats
 * Returns blog analytics for the logged-in contributor.
 */
require_once 'db.php';
require_once 'auth_check.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$userId = (int)($_SESSION['admin_id'] ?? 0);
if (!$userId) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

try {
    // Contributor can only see their own stats
    $stmt = $pdo->prepare(
        "SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS drafts,
            SUM(CASE WHEN submission_status = 'submitted' OR submission_status = 'edited' THEN 1 ELSE 0 END) AS submitted,
            SUM(CASE WHEN submission_status = 'approved' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN submission_status = 'rejected' OR status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
            COALESCE(SUM(view_count), 0) AS total_views
         FROM blogs
         WHERE author_id = ?"
    );
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    // Comments on contributor's blogs (post_id stores slug or id as text)
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) AS total_comments
         FROM comments
         WHERE post_id IN (
             SELECT slug FROM blogs WHERE author_id = ?
             UNION
             SELECT CAST(id AS CHAR) FROM blogs WHERE author_id = ?
         )"
    );
    $stmt->execute([$userId, $userId]);
    $comments = (int)$stmt->fetchColumn();

    // 4. Pending Reviews (if they have the permission) - EXCLUDE OWN BLOGS
    $pending_reviews = 0;
    // We check session permissions directly here
    $perms = $_SESSION['permissions'] ?? [];
    if (!empty($perms['can_review_blogs']) || (isset($_SESSION['role']) && $_SESSION['role'] === 'admin')) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM blogs WHERE submission_status IN ('submitted', 'edited') AND author_id != ?");
        $stmt->execute([$userId]);
        $pending_reviews = (int)$stmt->fetchColumn();
    }

    // 5. Total Ads (if they can manage ads)
    $total_ads = 0;
    if (!empty($perms['can_manage_ads']) || (isset($_SESSION['role']) && $_SESSION['role'] === 'admin')) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM ads");
        $total_ads = (int)$stmt->fetchColumn();
    }

    // 6. Pending & Rejected Comments (if they can manage comments)
    $pending_comments = 0;
    $rejected_comments = 0;
    if (!empty($perms['can_manage_comments']) || (isset($_SESSION['role']) && $_SESSION['role'] === 'admin')) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM comments WHERE status = 'pending'");
        $pending_comments = (int)$stmt->fetchColumn();
        
        $stmt = $pdo->query("SELECT COUNT(*) FROM comments WHERE status = 'rejected'");
        $rejected_comments = (int)$stmt->fetchColumn();
    }

    // 7. Total Announcements (if they can manage announcements)
    $total_announcements = 0;
    if (!empty($perms['can_manage_announcements']) || (isset($_SESSION['role']) && $_SESSION['role'] === 'admin')) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM announcements");
        $total_announcements = (int)$stmt->fetchColumn();
    }

    echo json_encode([
        'status'              => 'success',
        'total'               => (int)$row['total'],
        'drafts'              => (int)$row['drafts'],
        'submitted'           => (int)$row['submitted'],
        'approved'            => (int)$row['approved'],
        'rejected'            => (int)$row['rejected'],
        'total_views'         => (int)$row['total_views'],
        'total_comments'      => $comments,
        'pending_reviews'     => $pending_reviews,
        'total_ads'           => $total_ads,
        'pending_comments'    => $pending_comments,
        'rejected_comments'   => $rejected_comments,
        'total_announcements' => $total_announcements,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
