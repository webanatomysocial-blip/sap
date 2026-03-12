<?php
/**
 * api/admin_members.php
 * Admin-only endpoint for managing member registrations.
 *
 * GET  /admin/members?status=all|pending|approved|rejected
 * POST /admin/members  { action: approve|reject|delete, id: <member_id> }
 */
require_once 'auth_check.php';
require_once 'permission_check.php';

header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) session_start();

$isLoggedIn = !empty($_SESSION['admin_logged_in']);
$role       = $_SESSION['role'] ?? 'guest';

if (!$isLoggedIn || $role !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Admin access required.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $status = $_GET['status'] ?? 'all';

        if ($status === 'all') {
            $stmt = $pdo->prepare("SELECT id, name, phone, email, location, company_name, job_role, profile_image, status, rejection_reason, created_at, approved_at FROM members ORDER BY created_at DESC");
            $stmt->execute();
        } else {
            $stmt = $pdo->prepare("SELECT id, name, phone, email, location, company_name, job_role, profile_image, status, rejection_reason, created_at, approved_at FROM members WHERE status = ? ORDER BY created_at DESC");
            $stmt->execute([$status]);
        }

        $members = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'members' => $members]);
        exit;
    }

    if ($method === 'POST') {
        $input  = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $input['action'] ?? '';
        $id     = (int)($input['id'] ?? 0);
        $reason = $input['rejection_reason'] ?? null;

        if (!$id || !in_array($action, ['approve', 'reject', 'delete'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid action or ID.']);
            exit;
        }

        if ($action === 'approve') {
            $stmt = $pdo->prepare("UPDATE members SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Member approved successfully.']);
        } elseif ($action === 'reject') {
            if ($reason) {
                $stmt = $pdo->prepare("UPDATE members SET status = 'rejected', rejection_reason = ? WHERE id = ?");
                $stmt->execute([$reason, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE members SET status = 'rejected' WHERE id = ?");
                $stmt->execute([$id]);
            }
            echo json_encode(['status' => 'success', 'message' => 'Member rejected.']);
        } elseif ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM members WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Member deleted.']);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);

} catch (Exception $e) {
    error_log('[admin_members] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
