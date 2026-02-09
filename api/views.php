<?php
// api/views.php
require_once 'db.php';

header('Content-Type: application/json');

// Get the post_id from query string or body
$post_id = $_REQUEST['post_id'] ?? null;

if (!$post_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Post ID is required']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Function to get the real IP address (System/Public IP)
function get_client_ip() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // HTTP_X_FORWARDED_FOR can be a comma-separated list of IPs
        // The first IP is the original client IP
        $ip_list = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ip_list[0]);
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}

$ip_address = get_client_ip();
// Append User Agent to create a more unique fingerprint for the session/view
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

// Generate a unique fingerprint for the device
// This allows different devices on the same network (same IP) to be counted separately
$device_fingerprint = md5($ip_address . $user_agent);

try {
    if ($method === 'GET') {
        // Fetch view count
        $stmt = $pdo->prepare("SELECT count FROM views WHERE post_id = ?");
        $stmt->execute([$post_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['views' => $result ? (int)$result['count'] : 0]);
    } 
    elseif ($method === 'POST') {
        // Read JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        $viewer_id = $input['viewer_id'] ?? null;

        // Determine effective identifier:
        // If viewer_id is present (from client), use that.
        // Otherwise fallback to IP+UA hash.
        if ($viewer_id) {
            // Identify by Client UUID
            // We still store it in the ip_address column for schema compatibility
            // but prefix it to distinguish
            $identifier = "uuid:" . $viewer_id;
        } else {
            // Fallback: Device Fingerprint (IP + UA)
            $identifier = "ip:" . md5($ip_address . $user_agent);
        }

        // Check if this Identifier has already viewed this post
        $checkStmt = $pdo->prepare("SELECT id FROM view_logs WHERE post_id = ? AND ip_address = ?");
        $checkStmt->execute([$post_id, $identifier]);
        $hasViewed = $checkStmt->fetch();

        if (!$hasViewed) {
            // First time view: Log it and increment count
            $pdo->beginTransaction();
            
            // Log the view with the identifier
            $logStmt = $pdo->prepare("INSERT INTO view_logs (post_id, ip_address) VALUES (?, ?)");
            $logStmt->execute([$post_id, $identifier]);

            // Increment count
            $upsertStmt = $pdo->prepare("INSERT INTO views (post_id, count) VALUES (?, 1) 
                                       ON CONFLICT(post_id) DO UPDATE SET count = count + 1");
            $upsertStmt->execute([$post_id]);
            
            $pdo->commit();
        }

        // Return current count
        $countStmt = $pdo->prepare("SELECT count FROM views WHERE post_id = ?");
        $countStmt->execute([$post_id]);
        $result = $countStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['views' => $result ? (int)$result['count'] : 1]);
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
