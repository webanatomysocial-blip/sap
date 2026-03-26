<?php
// api/verify_otp.php
require_once 'db.php';
require_once 'services/OTPService.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($input['email'] ?? '');
$code  = trim($input['code'] ?? '');
$type  = trim($input['type'] ?? 'signup');

if (!$email || !$code) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email and code are required.']);
    exit;
}

$otpService = new OTPService();

try {
    $otpService->verifyOTP($email, $code, $type);
    echo json_encode(['status' => 'success', 'message' => 'Verification successful.']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
