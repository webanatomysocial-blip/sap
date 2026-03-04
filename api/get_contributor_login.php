<?php
/**
 * GET /api/admin/contributor-login?contributor_id=X
 * Returns login/permissions info for a contributor (for modal display).
 */
require_once 'db.php';
require_once 'auth_check.php';
require_once 'permission_check.php';

header('Content-Type: application/json');

requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$contributorId = (int)($_GET['contributor_id'] ?? 0);
if (!$contributorId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'contributor_id is required']);
    exit;
}

try {
    // Find user account linked to this contributor
    $stmt = $pdo->prepare(
        "SELECT u.id AS user_id, u.username, u.is_active,
                p.can_manage_blogs, p.can_manage_ads,
                p.can_manage_comments, p.can_manage_announcements,
                p.can_review_blogs
         FROM users u
         LEFT JOIN user_permissions p ON p.user_id = u.id
         WHERE u.contributor_id = ? AND u.role = 'contributor'
         LIMIT 1"
    );
    $stmt->execute([$contributorId]);
    $row = $stmt->fetch();

    if (!$row) {
        echo json_encode(['status' => 'success', 'has_login' => false]);
        exit;
    }

    echo json_encode([
        'status'    => 'success',
        'has_login' => true,
        'user_id'   => $row['user_id'],
        'username'  => $row['username'],
        'is_active' => (bool)$row['is_active'],
        'permissions' => [
            'can_manage_blogs'         => (bool)$row['can_manage_blogs'],
            'can_manage_ads'           => (bool)$row['can_manage_ads'],
            'can_manage_comments'      => (bool)$row['can_manage_comments'],
            'can_manage_announcements' => (bool)$row['can_manage_announcements'],
            'can_review_blogs'         => (bool)$row['can_review_blogs'],
        ],
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal error: ' . $e->getMessage()]);
}
?>
