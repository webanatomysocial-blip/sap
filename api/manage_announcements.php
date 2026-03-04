<?php
// api/manage_announcements.php
require_once 'db.php';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    define('ALLOW_PUBLIC_API', true);
}
require_once 'auth_check.php';
require_once 'permission_check.php';
// Allow admin OR contributor with specific permission
if ($method !== 'GET' || strpos($_SERVER['REQUEST_URI'], '/admin/') !== false) {
    checkPermission('can_manage_announcements');
}

require_once 'services/AnnouncementService.php';

$annService = new AnnouncementService($pdo);

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$currentDateTime = gmdate('Y-m-d H:i:s');
$isAdmin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';

try {
    if ($method === 'GET') {
        $announcements = $annService->getAnnouncements($isAdmin, $currentDateTime);
        
        foreach ($announcements as &$announcement) {
            if (!empty($announcement['date'])) {
                $announcement['date'] = gmdate('F j, Y', strtotime($announcement['date']));
            }
        }
        
        echo json_encode($announcements);
    } 
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $result = $annService->saveAnnouncement($input, $isAdmin, $currentDateTime);
        echo json_encode($result);
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ID required");
        $annService->deleteAnnouncement($id);
        echo json_encode(['status' => 'success', 'message' => 'Announcement deleted']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
