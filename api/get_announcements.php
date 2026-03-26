<?php
require_once 'db.php';

header('Content-Type: application/json');

$isAdmin = isset($_GET['admin']) && $_GET['admin'] == 1;

try {
    if ($isAdmin) {
        // Secure admin view
    if (!defined('ALLOW_PUBLIC_API')) {
        define('ALLOW_PUBLIC_API', true);
    }
    require_once 'auth_check.php';
        require_once 'permission_check.php';
        checkPermission('can_manage_announcements');
        
        $stmt = $pdo->prepare("SELECT id, title, date, link, status, publish_date FROM announcements ORDER BY created_at DESC, date DESC");
        $stmt->execute();
    } else {
        // Public view - Enforced via status and date
        $stmt = $pdo->prepare("SELECT id, title, date, link, status, publish_date FROM announcements WHERE status IN ('approved', 'active', 'published') AND date <= ? ORDER BY date DESC, created_at DESC LIMIT 10");
        $stmt->execute([date('Y-m-d H:i:s')]);
    }
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates to "February 5, 2026" style
    foreach ($announcements as &$announcement) {
        if (isset($announcement['date'])) {
            $timestamp = strtotime($announcement['date']);
            $announcement['date'] = gmdate('F j, Y', $timestamp);
        }
    }
    
    echo json_encode($announcements);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
