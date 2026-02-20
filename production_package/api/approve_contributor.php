<?php
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? intval($data['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid ID"]);
    exit;
}

try {
    // 1. Update Status
    $stmt = $pdo->prepare("UPDATE contributor_applications SET status = 'approved' WHERE id = :id");
    $stmt->execute([':id' => $id]);

    // 2. Fetch User Details for Email
    $stmtUser = $pdo->prepare("SELECT name, email, role FROM contributor_applications WHERE id = :id");
    $stmtUser->execute([':id' => $id]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $to = $user['email'];
        $subject = "Welcome to the SAP Security Expert Community!";
        $message = "Hello " . $user['name'] . ",\n\n" .
                   "Congratulations! Your application to become a '" . $user['role'] . "' has been approved.\n\n" .
                   "We are thrilled to have you onboard. You can now start contributing.\n\n" .
                   "Best Regards,\nSAP Security Expert Team";
        
        $headers = "From: hello@sapsecurityexpert.com";

        // Attempt to send email
        @mail($to, $subject, $message, $headers);
    }

    echo json_encode(["status" => "success", "message" => "Application approved and email sent."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
