<?php
// api/save_view.php
require_once 'db.php';

header("Content-Type: application/json");

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$postId = $input['post_id'] ?? null;
$visitorToken = $input['visitor_token'] ?? null;

if (!$postId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Post ID is required"]);
    exit;
}

try {
    // Basic deduplication could be done here with a separate 'views' table tracking visitor_token + post_id + date
    // For now, we just increment the counter on the blog post directly for simplicity
    
    // Check if blog exists first
    $stmt = $pdo->prepare("SELECT id FROM blogs WHERE slug = ? OR id = ?");
    $stmt->execute([$postId, $postId]);
    $blog = $stmt->fetch();

    if ($blog) {
        // Unique View Check
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        // Check if this visitor (IP or Token) has already viewed this post today
        // We can restrict by IP OR by visitor_token to be more robust
        $checkStmt = $pdo->prepare("SELECT id FROM post_views WHERE post_id = ? AND (ip_address = ? OR visitor_token = ?)");
        $checkStmt->execute([$blog['id'], $ipAddress, $visitorToken]);
        $existingView = $checkStmt->fetch();

        if (!$existingView) {
            // Record the view
            $insertStmt = $pdo->prepare("INSERT INTO post_views (post_id, ip_address, visitor_token) VALUES (?, ?, ?)");
            $insertStmt->execute([$blog['id'], $ipAddress, $visitorToken]);

            // Increment blog view count
            $updateStmt = $pdo->prepare("UPDATE blogs SET view_count = view_count + 1 WHERE id = ?");
            $updateStmt->execute([$blog['id']]);
            
            echo json_encode(["status" => "success", "message" => "View counted"]);
        } else {
            // View already counted for this user/IP
            echo json_encode(["status" => "ignored", "message" => "View already counted"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Blog not found"]);
    }

} catch (PDOException $e) {
    // Silent fail ideally, but for debugging:
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
