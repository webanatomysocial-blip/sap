<?php
/**
 * api/reset_contributor_password.php
 * POST /api/admin/reset-contributor-password
 * Admin-only: generate new random password for a contributor login
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

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$userId = (int)($input['user_id'] ?? 0);

if (!$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'user_id is required']);
    exit;
}

try {
    // Verify target is a contributor, not admin
    $stmt = $pdo->prepare("SELECT id, role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        exit;
    }
    if ($user['role'] === 'admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Cannot reset admin password via this endpoint']);
        exit;
    }

    // Generate a strong random password: Sap@XXXX (8 chars min, mixed)
    $suffix  = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
    $newPass = 'Sap@' . $suffix;

    $hashed = password_hash($newPass, PASSWORD_BCRYPT);
    $pdo->beginTransaction();

    // 1. Update users table (Dashboard)
    $stmtUser = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmtUser->execute([$hashed, $userId]);

    // 2. Sync to members table (Frontend)
    // Fetch the email first from users table
    $stmtEmail = $pdo->prepare("SELECT email FROM users WHERE id = ?");
    $stmtEmail->execute([$userId]);
    $email = $stmtEmail->fetchColumn();

    if ($email) {
        $stmtMember = $pdo->prepare("UPDATE members SET password_hash = ? WHERE LOWER(email) = LOWER(?)");
        $stmtMember->execute([$hashed, $email]);
    }

    $pdo->commit();

    echo json_encode([
        'status'      => 'success',
        'message'     => 'Password reset successfully for both dashboard and member login',
        'new_password'=> $newPass,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
