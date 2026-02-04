<?php
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

// Simple validation
if (empty($data['name']) || empty($data['email']) || empty($data['role'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// Prepare statement for SQLite
try {
    $stmt = $pdo->prepare("INSERT INTO contributor_applications (name, email, linkedin, role, message) VALUES (:name, :email, :linkedin, :role, :message)");
    
    $stmt->execute([
        ':name' => $data['name'],
        ':email' => $data['email'],
        ':linkedin' => $data['linkedin'] ?? '',
        ':role' => $data['role'],
        ':message' => $data['message'] ?? ''
    ]);

    echo json_encode(["status" => "success", "message" => "Application submitted successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
