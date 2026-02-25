<?php
// api/save_view.php
session_start();
require_once 'db.php';

header("Content-Type: application/json");
if (!headers_sent()) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    } else {
        header("Access-Control-Allow-Origin: *");
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$postId = $input['post_id'] ?? null;
$visitorToken = $input['visitor_token'] ?? null;

if (!$postId) {
    echo json_encode(["status" => "error", "message" => "Post ID is required"]);
    exit;
}

try {
    // Check if blog exists 
    $stmt = $pdo->prepare("SELECT id FROM blogs WHERE slug = ? OR id = ?");
    $stmt->execute([$postId, $postId]);
    $blog = $stmt->fetch();

    if ($blog) {
        // Simple session-based deduplication to prevent view spamming
        if (!isset($_SESSION['viewed_blog_' . $blog['id']])) {
            $updateStmt = $pdo->prepare("UPDATE blogs SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?");
            $updateStmt->execute([$blog['id']]);
            
            $_SESSION['viewed_blog_' . $blog['id']] = true;
            echo json_encode(["status" => "success", "message" => "View counted"]);
        } else {
            echo json_encode(["status" => "ignored", "message" => "View already counted in session"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Blog not found"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
