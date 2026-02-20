<?php
// api/views.php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get the post_id from query string or body
$post_id = $_REQUEST['post_id'] ?? null;

if (!$post_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Post ID is required']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Function to get the real IP address
function get_client_ip() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip_list = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ip_list[0]);
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}

$ip_address = get_client_ip();

try {
    if ($method === 'GET') {
        // Fetch view count from blog_views table
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM blog_views WHERE post_id = ?");
        $stmt->execute([$post_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['views' => $result ? (int)$result['count'] : 0]);
    } 
    elseif ($method === 'POST') {
        // Read JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        $visitor_token = $input['visitor_token'] ?? null;

        if (!$visitor_token) {
             // Fallback if no token provided, though frontend should send it
             $visitor_token = 'ip_' . md5($ip_address . ($_SERVER['HTTP_USER_AGENT'] ?? ''));
        }

        // Check if this visitor has already viewed this post
        $checkStmt = $pdo->prepare("SELECT id FROM blog_views WHERE post_id = ? AND visitor_token = ?");
        $checkStmt->execute([$post_id, $visitor_token]);
        $hasViewed = $checkStmt->fetch();

        if (!$hasViewed) {
            // First time view: Log it
            $logStmt = $pdo->prepare("INSERT INTO blog_views (post_id, visitor_token, ip_address) VALUES (?, ?, ?)");
            $logStmt->execute([$post_id, $visitor_token, $ip_address]);

             // Update the cache count in blogs table for performance (optional but good practice)
            $updateStmt = $pdo->prepare("UPDATE blogs SET view_count = (SELECT COUNT(*) FROM blog_views WHERE post_id = ?) WHERE id = ? OR slug = ?");
            $updateStmt->execute([$post_id, $post_id, $post_id]);
        }

        // Return current count using the same logic as GET
        $countStmt = $pdo->prepare("SELECT COUNT(*) as count FROM blog_views WHERE post_id = ?");
        $countStmt->execute([$post_id]);
        $result = $countStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['views' => $result ? (int)$result['count'] : 0]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>

