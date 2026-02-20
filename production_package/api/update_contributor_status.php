<?php
// api/update_contributor_status.php
require_once 'db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid input"]);
    exit;
}

$id = $data['id'];
$status = $data['status']; // 'approved', 'rejected', 'pending'

try {
    $stmt = $pdo->prepare("UPDATE contributors SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);

    // Optional: Send email notification logic here based on status

    echo json_encode(["status" => "success", "message" => "Status updated successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
