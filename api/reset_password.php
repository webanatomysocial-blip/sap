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

    // 4. Hash and Update
    $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
    
    $sql = "UPDATE users SET password = ? ";
    $params = [$newHash];

    // Handle timestamps for MySQL vs SQLite
    if (getenv('DB_CONNECTION') === 'sqlite' || !isset($_ENV['DB_CONNECTION']) || $_ENV['DB_CONNECTION'] === 'sqlite') {
        $sql .= ", updated_at = datetime('now') ";
    } else {
        $sql .= ", updated_at = NOW() ";
    }

    $sql .= " WHERE id = ?";
    $params[] = $adminId;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        'status' => 'success',
        'message' => 'Password updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal Server Error']);
}
?>
