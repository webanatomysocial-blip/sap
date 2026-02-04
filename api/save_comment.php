<?php
// api/save_comment.php
require 'db.php';

header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON input."]);
        exit;
    }

    // SPAM PROTECTION: Honeypot & Math Challenge
    if (!empty($data['website_url'])) { 
        // If hidden honeypot field is filled, it's a bot
        http_response_code(400); 
        echo json_encode(["status" => "error", "message" => "Spam detected."]); 
        exit; 
    }
    
    // Validate Math Challenge (Simple 2+2 check passed from frontend)
    if (!isset($data['math_answer']) || intval($data['math_answer']) !== 4) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Incorrect math answer."]);
        exit;
    }

    $blogId = isset($data['blogId']) ? trim($data['blogId']) : '';
    $author = isset($data['author']) ? trim($data['author']) : '';
    $text = isset($data['text']) ? trim($data['text']) : '';

    if (empty($blogId) || empty($author) || empty($text)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "All fields (author, text) are required."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO comments (post_id, user_name, content) VALUES (:post_id, :user_name, :content)");
        $stmt->execute([
            ':post_id' => $blogId,
            ':user_name' => htmlspecialchars($author),
            ':content' => htmlspecialchars($text)
        ]);

        echo json_encode(["status" => "success", "message" => "Comment saved successfully."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
}
?>
