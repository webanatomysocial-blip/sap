<?php
/**
 * api/auth_check.php
 * Centralized session guard + CSRF validator.
 *
 * Changes in this version:
 *  - Per-request is_active check: deactivated accounts are blocked immediately
 *    (session destroyed, 403 returned) even if session was valid at login.
 *  - CSRF extended to cover PUT requests.
 *
 * Include at the top of any protected endpoint AFTER db.php.
 *
 * Rollback: revert to the previous version that lacked is_active check.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ── 1. Authentication check ───────────────────────────────────────────────────
$allowPublic = defined('ALLOW_PUBLIC_API') && ALLOW_PUBLIC_API === true;

if (
    !isset($_SESSION['admin_logged_in']) ||
    $_SESSION['admin_logged_in'] !== true
) {
    if (!$allowPublic) {
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        http_response_code(401);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Unauthorized. Please log in.',
        ]);
        exit;
    }
}

// ── 2. Per-request is_active check ────────────────────────────────────────────
// Deactivating a contributor in the admin panel must take effect on the NEXT
// request — not just at the next login.
if (isset($_SESSION['is_active']) && $_SESSION['is_active'] == 0) {
    // Destroy the session so they are fully logged out
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }
    session_destroy();

    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    http_response_code(403);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Account has been deactivated. Contact administrator.',
    ]);
    exit;
}

// ── 3. CSRF validation for mutating methods ──────────────────────────────────
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE', 'PATCH'])) {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $lowerHeaders = array_change_key_case($headers, CASE_LOWER);
    
    // Check Header or POST/FormData payload
    $csrfToken = $lowerHeaders['x-csrf-token'] 
               ?? $_SERVER['HTTP_X_CSRF_TOKEN'] 
               ?? $_POST['csrf_token'] 
               ?? '';

    if (!isset($_SESSION['csrf_token']) || $csrfToken !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Your session is invalid or expired. Please refresh the page. (CSRF validation failed)'
        ]);
        exit;
    }
}
?>
