<?php
/**
 * api/auth_check.php
 * Centralized admin session guard.
 *
 * Include at the top of any admin-only PHP endpoint AFTER db.php.
 * Starts the session and immediately exits with 401 JSON if the admin
 * session flag is not set.
 *
 * Usage:
 *   require_once 'auth_check.php';
 *
 * Rollback: Remove this file and the require_once lines added to each endpoint.
 */

// Only start session if one is not already active (db.php may have started it)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (
    !isset($_SESSION['admin_logged_in']) ||
    $_SESSION['admin_logged_in'] !== true
) {
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    http_response_code(401);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Unauthorized. Admin session required.'
    ]);
    exit;
}

// Phase 5: CSRF Token Validation for state-changing endpoints
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $clientToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    // Use hash_equals to prevent timing attacks
    if (empty($clientToken) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $clientToken)) {
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        http_response_code(403);
        echo json_encode([
            'status'  => 'error',
            'message' => 'CSRF validation failed'
        ]);
        exit;
    }
}
?>
