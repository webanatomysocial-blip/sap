<?php
/**
 * POST /api/admin/reset-password
 * Resets admin password with strict security rules.
 */
require_once 'db.php';
require_once 'auth_check.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$currentPassword = $input['current_password'] ?? '';
$newPassword = $input['new_password'] ?? '';
$confirmPassword = $input['confirm_password'] ?? '';

if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit;
}

if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'New password must be at least 8 characters long']);
    exit;
}

if ($newPassword !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Passwords do not match']);
    exit;
}

$adminId = $_SESSION['admin_id'];

try {
    // 1. Fetch current hash
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$adminId]);
    $currentHash = $stmt->fetchColumn();

    if (!$currentHash) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        exit;
    }

    // 2. Verify current password
    if (!password_verify($currentPassword, $currentHash)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Incorrect current password']);
        exit;
    }

    // 3. Ensure new password is not the same as current
    if (password_verify($newPassword, $currentHash)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'New password cannot be the same as current password']);
        exit;
    }

    // Hash and Update
    $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
    $now = date('Y-m-d H:i:s');
    
    // 1. Update users table
    $stmt = $pdo->prepare("UPDATE users SET password = ?, updated_at = ? WHERE id = ?");
    $stmt->execute([$newHash, $now, $adminId]);

    // 2. Sync to members table if applicable
    $stmt = $pdo->prepare("SELECT email FROM users WHERE id = ?");
    $stmt->execute([$adminId]);
    $email = $stmt->fetchColumn();

    if ($email) {
        $stmt = $pdo->prepare("UPDATE members SET password_hash = ? WHERE LOWER(email) = LOWER(?)");
        $stmt->execute([$newHash, $email]);
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Password updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal Server Error']);
}
?>
