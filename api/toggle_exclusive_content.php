<?php
// /Users/webanatomy/Desktop/sap-security-expert-new/api/toggle_exclusive_content.php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/services/CacheService.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;
$is_members_only = isset($data['is_members_only']) ? (int)$data['is_members_only'] : null;

if (!$id || $is_members_only === null) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing ID or is_members_only flag.']);
    exit;
}

try {
    global $pdo;
    $db = $pdo;
    
    $stmt = $db->prepare('UPDATE blogs SET is_members_only = ? WHERE id = ?');
    $stmt->execute([$is_members_only, $id]);
    
    if ($stmt->rowCount() > 0) {
        // Invalidate homepage cache
        $cache = new CacheService();
        $cache->invalidate('homepage_data_public');

        echo json_encode([
            'status' => 'success',
            'message' => 'Exclusive content status updated successfully.',
            'is_members_only' => $is_members_only
        ]);
    } else {
        // Checking if the blog exists or if the value was already the same
        $checkStmt = $db->prepare('SELECT is_members_only FROM blogs WHERE id = ?');
        $checkStmt->execute([$id]);
        $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row && $row['is_members_only'] == $is_members_only) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Status was already set to this value.',
                'is_members_only' => $is_members_only
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Blog not found.']);
        }
    }
} catch (PDOException $e) {
    error_log("Database Error in toggle_exclusive_content.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error while updating blog.']);
}
