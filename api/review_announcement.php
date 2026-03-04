<?php
/**
 * api/review_announcement.php
 * PUT /api/admin/announcements/{id}/review
 */
require_once 'db.php';
require_once 'auth_check.php';
require_once 'permission_check.php';
require_once 'services/AnnouncementService.php';

header('Content-Type: application/json');

checkPermission('can_manage_announcements');

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$id = $_GET['id'] ?? null;
$input = json_decode(file_get_contents('php://input'), true) ?? [];
if (!$id) $id = $input['id'] ?? null;
$action = strtolower(trim($input['action'] ?? ''));

if (!$id || !in_array($action, ['approve', 'reject'], true)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => '"id" and "action" (approve|reject) are required']);
    exit;
}

$annService = new AnnouncementService($pdo);

try {
    $result = $annService->reviewAnnouncement($id, $action);
    if ($result['status'] === 'error') http_response_code(404);
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
