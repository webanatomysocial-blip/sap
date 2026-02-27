<?php
/**
 * GET /api/admin/profile
 * Returns the current admin's profile data.
 */
require_once 'db.php';
require_once 'auth_check.php';

header("Content-Type: application/json");

try {
    $adminId = $_SESSION['admin_id'];
    
    $stmt = $pdo->prepare("SELECT id, username, full_name, email, profile_image FROM users WHERE id = ?");
    $stmt->execute([$adminId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'profile_image' => $user['profile_image']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal Server Error']);
}
?>
