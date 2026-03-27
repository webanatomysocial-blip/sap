<?php
// api/ads_click.php - Track an ad click by zone
require_once 'db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$zone  = trim($input['zone'] ?? '');

if (empty($zone)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Zone is required']);
    exit;
}

try {
    // Increment click count. If the zone doesn't exist yet, this silently does nothing.
    $stmt = $pdo->prepare("UPDATE ads SET clicks = COALESCE(clicks, 0) + 1 WHERE zone = ?");
    $stmt->execute([$zone]);
    echo json_encode(['status' => 'success', 'message' => 'Click tracked']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
