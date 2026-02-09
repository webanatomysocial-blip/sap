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
    $email = isset($data['email']) ? trim($data['email']) : '';
    $text = isset($data['text']) ? trim($data['text']) : '';

    if (empty($blogId) || empty($author) || empty($text) || empty($email)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "All fields (author, email, text) are required."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO comments (post_id, user_name, email, content, status) VALUES (:post_id, :user_name, :email, :content, 'pending')");
        $stmt->execute([
            ':post_id' => $blogId,
            ':user_name' => htmlspecialchars($author),
            ':email' => htmlspecialchars($email),
            ':content' => htmlspecialchars($text)
        ]);

        echo json_encode(["status" => "success", "message" => "Comment saved successfully. It will be visible after approval."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
}
?>
