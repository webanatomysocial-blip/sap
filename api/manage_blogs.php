<?php
/**
 * api/manage_blogs.php
 * Handles all blog CRUD operations.
 *
 * RBAC hardening:
 *   - Admin:       Full access, all blogs.
 *   - Contributor: GET/UPDATE/DELETE scoped to author_id = current user.
 *     UPDATE and DELETE use WHERE id=? AND author_id=? to prevent privilege escalation.
 *   - Anonymous:   Read only published+approved blogs.
 *
 * Routes (via api/index.php):
 *   GET    /api/posts               — list
 *   GET    /api/posts/{id|slug}     — single
 *   POST   /api/posts               — create/update
 *   DELETE /api/posts/{id}          — delete
 */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    define('ALLOW_PUBLIC_API', true);
}
require_once 'auth_check.php';
require_once 'utils.php';            // deleteImage() helper
require_once 'services/BlogService.php';

$blogService = new BlogService($pdo);
require_once 'permission_check.php'; // defines checkPermission() and requireAdmin()


header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

// ── Determine session context ────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$isLoggedIn    = !empty($_SESSION['admin_logged_in']);
$role          = $_SESSION['role'] ?? 'guest';
$isAdmin       = $isLoggedIn && $role === 'admin';
$isContributor = $isLoggedIn && $role === 'contributor';
$currentUserId = $_SESSION['admin_id'] ?? null;
$currentDate   = gmdate('Y-m-d');
$currentDateTime = gmdate('Y-m-d H:i:s');

// ── Permission gate for write operations ─────────────────────────────────────
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    if (!$isLoggedIn) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
        exit;
    }
    if ($isContributor) {
        checkPermission('can_manage_blogs');
    }
}
if ($method === 'DELETE') {
    if (!$isLoggedIn) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
        exit;
    }
    if ($isContributor) {
        checkPermission('can_manage_blogs');
    }
}

try {
    // ════════════════════════════════════════════════════════════════════════
    // GET — List or Single
    // ════════════════════════════════════════════════════════════════════════
    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;
        $slug = $_GET['slug'] ?? null;

        if ($id || $slug) {
            $blog = $blogService->getBlog($id ?: $slug, $currentUserId, $role, $currentDateTime);
            if (!$blog) {
                http_response_code(404);
                echo json_encode(['error' => 'Blog post not found']);
                exit;
            }
            echo json_encode($blog);
            exit;
        }

        $blogs = $blogService->getBlogs($currentUserId, $role, $currentDateTime);
        echo json_encode($blogs);
        exit;
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST — Create or Update
    // ════════════════════════════════════════════════════════════════════════
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        // Ensure publish_date formatting if present
        if (!empty($input['publish_date']) && strlen((string)$input['publish_date']) === 10) {
            $input['publish_date'] .= ' 00:00:00';
        }
        
        $result = $blogService->saveBlog($input, $currentUserId, $role, $currentDateTime);
        if ($result['status'] === 'error') {
            http_response_code(400);
        }
        echo json_encode($result);
        exit;
    }

    // ════════════════════════════════════════════════════════════════════════
    // DELETE
    // ════════════════════════════════════════════════════════════════════════
    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? $_GET['slug'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID required']);
            exit;
        }

        $success = $blogService->deleteBlog($id, $currentUserId, $role);
        if ($success) {
            echo json_encode(['status' => 'success', 'message' => 'Blog deleted']);
        } else {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Delete failed or unauthorized']);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);

} catch (Exception $e) {
    error_log('[manage_blogs] Exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'A server error occurred. Please try again.']);
}
?>