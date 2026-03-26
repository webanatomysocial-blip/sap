<?php
require_once 'db.php';
require_once 'auth_check.php';
require_once 'permission_check.php';
requireAdmin();

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
    $stmt = $pdo->prepare("UPDATE contributors SET status = 'approved' WHERE id = :id");
    $stmt->execute([':id' => $id]);

    // 2. Fetch User Details for Email
    $stmtUser = $pdo->prepare("SELECT full_name, email, role FROM contributors WHERE id = :id");
    $stmtUser->execute([':id' => $id]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        require_once 'services/NotificationService.php';
        $ns = new NotificationService();
        $siteUrl = getenv('SITE_URL') ?: 'http://localhost:5173';
        $loginUrl = $siteUrl . '/member/login';
        $ns->notifyContributorApproved($user['email'], $user['full_name'], $loginUrl);
    }

    echo json_encode(["status" => "success", "message" => "Application approved and email sent."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
