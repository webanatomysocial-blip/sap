<?php
// api/update_contributor_status.php
require_once 'db.php';
require_once 'auth_check.php';
require_once 'permission_check.php';
requireAdmin();

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid input"]);
    exit;
}

$id = $data['id'];
$status = $data['status']; // 'approved', 'rejected', 'pending'
$reason = $data['rejection_reason'] ?? null;

try {
    $stmt = $pdo->prepare("UPDATE contributors SET status = ?, rejection_reason = ? WHERE id = ?");
    $stmt->execute([$status, $reason, $id]);

    // Send email notification based on status
    $stmtUser = $pdo->prepare("SELECT full_name, email FROM contributors WHERE id = ?");
    $stmtUser->execute([$id]);
    $user = $stmtUser->fetch();

    if ($user) {
        require_once 'services/NotificationService.php';
        $ns = new NotificationService();
        
        if ($status === 'approved') {
            $siteUrl = getenv('SITE_URL') ?: 'http://localhost:5173';
            $loginUrl = $siteUrl . '/member/login';
            $ns->notifyContributorApproved($user['email'], $user['full_name'], $loginUrl);
        } elseif ($status === 'rejected') {
            $ns->notifyContributorRejected($user['email'], $user['full_name'], $reason ?: 'Does not meet our current requirements.');
        }
    }

    echo json_encode(["status" => "success", "message" => "Status updated successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
