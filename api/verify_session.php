<?php
/**
 * api/verify_session.php
 * Lightweight endpoint to verify PHP session status on frontend mount.
 */
require_once 'db.php';

header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $adminId = $_SESSION['admin_id'];
    $stmt = $pdo->prepare("SELECT id, username, role, full_name, profile_image FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$adminId]);
    $user = $stmt->fetch();

    if ($user) {
        $permStmt = $pdo->prepare("SELECT * FROM user_permissions WHERE user_id = ?");
        $permStmt->execute([$adminId]);
        $permRow = $permStmt->fetch();
        $permissions = [];
        if ($permRow) {
            $permissions = [
                'can_manage_blogs'         => (bool)$permRow['can_manage_blogs'],
                'can_manage_ads'           => (bool)$permRow['can_manage_ads'],
                'can_manage_comments'      => (bool)$permRow['can_manage_comments'],
                'can_manage_announcements' => (bool)$permRow['can_manage_announcements'],
                'can_review_blogs'         => (bool)($permRow['can_review_blogs'] ?? 0),
            ];
        }

        echo json_encode([
            'status' => 'success',
            'authenticated' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'full_name' => $user['full_name'],
                'profile_image' => $user['profile_image']
            ],
            'permissions' => $permissions
        ]);
        exit;
    }
} else if (isset($_SESSION['member_logged_in']) && $_SESSION['member_logged_in'] === true) {
    // --- Auto-Login for Contributors ---
    $email = $_SESSION['member_email'];
    $userStmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = 'contributor' AND is_active = 1 LIMIT 1");
    $userStmt->execute([$email]);
    $user = $userStmt->fetch();

    if ($user) {
        $_SESSION['admin_id'] = $user['id'];
        $_SESSION['admin_user'] = $user['username'];
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['role'] = $user['role'];
        $_SESSION['is_active'] = $user['is_active'];

        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        $permStmt = $pdo->prepare("SELECT * FROM user_permissions WHERE user_id = ?");
        $permStmt->execute([$user['id']]);
        $permRow = $permStmt->fetch();
        $permissions = [];
        if ($permRow) {
            $permissions = [
                'can_manage_blogs'         => (bool)$permRow['can_manage_blogs'],
                'can_manage_ads'           => (bool)$permRow['can_manage_ads'],
                'can_manage_comments'      => (bool)$permRow['can_manage_comments'],
                'can_manage_announcements' => (bool)$permRow['can_manage_announcements'],
                'can_review_blogs'         => (bool)($permRow['can_review_blogs'] ?? 0),
            ];
        }
        $_SESSION['permissions'] = $permissions;

        echo json_encode([
            'status' => 'success',
            'authenticated' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ],
            'permissions' => $permissions,
            'csrf_token' => $_SESSION['csrf_token']
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'authenticated' => false,
            'message' => 'Not an admin/contributor'
        ]);
    }
} else {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'authenticated' => false,
        'message' => 'Not authenticated'
    ]);
}
?>
