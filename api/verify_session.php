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
    echo json_encode([
        'status' => 'success',
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['admin_id'],
            'username' => $_SESSION['admin_user'],
            'role' => $_SESSION['role']
        ],
        'permissions' => $_SESSION['permissions'] ?? []
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'authenticated' => false,
        'message' => 'Not authenticated'
    ]);
}
?>
