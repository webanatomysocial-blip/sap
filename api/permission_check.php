<?php
/**
 * api/permission_check.php
 * RBAC permission middleware.
 *
 * Include AFTER auth_check.php in any endpoint that needs permission checking.
 *
 * Usage:
 *   require_once 'permission_check.php';
 *   checkPermission('can_manage_blogs');
 *
 * Rollback: Remove require_once and checkPermission() calls from endpoints.
 */

/**
 * Check if the current session user has the given permission.
 * Admin role always passes. Missing/false permission returns 403 JSON.
 *
 * @param string $key  One of: can_manage_blogs, can_manage_ads,
 *                             can_manage_comments, can_manage_announcements,
 *                             can_review_blogs
 */
function checkPermission(string $key): void {
    // Ensure session is started (auth_check.php should have done this)
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Admins bypass all permission checks
    if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
        return;
    }

    // Check is_active in session (guard against runtime deactivation)
    if (empty($_SESSION['is_active']) || $_SESSION['is_active'] != 1) {
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        http_response_code(403);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Account is deactivated. Contact administrator.',
        ]);
        exit;
    }

    // Contributor permission check
    $permissions = $_SESSION['permissions'] ?? [];
    if (empty($permissions[$key]) || $permissions[$key] != 1) {
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        http_response_code(403);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Access denied. You do not have permission to perform this action.',
        ]);
        exit;
    }
}

/**
 * Require the current user to be an admin. Returns 403 for contributors.
 */
function requireAdmin(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        http_response_code(403);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Admin access required.',
        ]);
        exit;
    }
}
?>
