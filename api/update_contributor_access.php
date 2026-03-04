<?php
/**
 * POST /api/admin/update-contributor-access
 * Admin updates permissions or is_active status for a contributor login.
 */
require_once 'db.php';
require_once 'auth_check.php';
require_once 'permission_check.php';

header('Content-Type: application/json');

requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$input       = json_decode(file_get_contents('php://input'), true);
$userId      = (int)($input['user_id'] ?? 0);
$permissions = $input['permissions'] ?? [];
$isActive    = isset($input['is_active']) ? (int)(bool)$input['is_active'] : null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'user_id is required']);
    exit;
}

try {
    // Fetch target user — verify it exists and is a contributor (prevent touching admin)
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $targetUser = $stmt->fetch();

    if (!$targetUser) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        exit;
    }
    if ($targetUser['role'] === 'admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Cannot modify admin accounts via this endpoint']);
        exit;
    }

    // Update is_active if provided
    if ($isActive !== null) {
        $stmt = $pdo->prepare("UPDATE users SET is_active = ? WHERE id = ? AND role = 'contributor'");
        $stmt->execute([$isActive, $userId]);
    }

    // Upsert user_permissions
    $canBlogs         = isset($permissions['can_manage_blogs'])         && $permissions['can_manage_blogs']         ? 1 : 0;
    $canAds           = isset($permissions['can_manage_ads'])           && $permissions['can_manage_ads']           ? 1 : 0;
    $canComments      = isset($permissions['can_manage_comments'])      && $permissions['can_manage_comments']      ? 1 : 0;
    $canAnnouncements = isset($permissions['can_manage_announcements']) && $permissions['can_manage_announcements'] ? 1 : 0;
    $canReview        = isset($permissions['can_review_blogs'])         && $permissions['can_review_blogs']         ? 1 : 0;

    // Check if row already exists
    $stmt = $pdo->prepare("SELECT id FROM user_permissions WHERE user_id = ?");
    $stmt->execute([$userId]);
    if ($stmt->fetch()) {
        $stmt = $pdo->prepare(
            "UPDATE user_permissions
             SET can_manage_blogs = ?, can_manage_ads = ?,
                 can_manage_comments = ?, can_manage_announcements = ?,
                 can_review_blogs = ?
             WHERE user_id = ?"
        );
        $stmt->execute([$canBlogs, $canAds, $canComments, $canAnnouncements, $canReview, $userId]);
    } else {
        $stmt = $pdo->prepare(
            "INSERT INTO user_permissions
             (user_id, can_manage_blogs, can_manage_ads, can_manage_comments, can_manage_announcements, can_review_blogs)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$userId, $canBlogs, $canAds, $canComments, $canAnnouncements, $canReview]);
    }

    echo json_encode(['status' => 'success', 'message' => 'Contributor access updated successfully']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal error: ' . $e->getMessage()]);
}
?>
