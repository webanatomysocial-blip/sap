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
$ip_address = $_SERVER['REMOTE_ADDR'];

try {
    if ($method === 'GET') {
        // Fetch view count
        $stmt = $pdo->prepare("SELECT count FROM views WHERE post_id = ?");
        $stmt->execute([$post_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['views' => $result ? (int)$result['count'] : 0]);
    } 
    elseif ($method === 'POST') {
        // Check if this IP has already viewed this post
        $checkStmt = $pdo->prepare("SELECT id FROM view_logs WHERE post_id = ? AND ip_address = ?");
        $checkStmt->execute([$post_id, $ip_address]);
        $hasViewed = $checkStmt->fetch();

        if (!$hasViewed) {
            // First time view: Log it and increment count
            $pdo->beginTransaction();
            
            // Log the view
            $logStmt = $pdo->prepare("INSERT INTO view_logs (post_id, ip_address) VALUES (?, ?)");
            $logStmt->execute([$post_id, $ip_address]);

            // Increment count
            $upsertStmt = $pdo->prepare("INSERT INTO views (post_id, count) VALUES (?, 1) 
                                         ON CONFLICT(post_id) DO UPDATE SET count = count + 1");
            $upsertStmt->execute([$post_id]);
            
            $pdo->commit();
        }

        // Return current count (whether incremented or not)
        $stmt = $pdo->prepare("SELECT count FROM views WHERE post_id = ?");
        $stmt->execute([$post_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['views' => $result ? (int)$result['count'] : 0]);
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
