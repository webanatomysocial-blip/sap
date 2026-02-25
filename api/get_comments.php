<?php
// api/get_comments.php
require 'db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $blogId = isset($_GET['blogId']) ? trim($_GET['blogId']) : '';

    if (empty($blogId)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Blog ID is required."]);
        exit;
    }

    try {
        // Only fetch APPROVED comments for public display
        // parent_id is needed for frontend grouping
        $stmt = $pdo->prepare("SELECT id, post_id, parent_id, user_name as author, content as text, timestamp as date FROM comments WHERE post_id = :post_id AND status = 'approved' ORDER BY timestamp ASC");
        $stmt->execute([':post_id' => $blogId]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($comments);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
}
?>
