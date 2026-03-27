<?php
// api/reset_password_otp.php
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
$password = trim($input['password'] ?? '');

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email and new password are required.']);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters long.']);
    exit;
}

$otpService = new OTPService();

try {
    // 1. Verify that the email was successfully verified for 'reset' type within the last 30 mins
    if (!$otpService->isVerified($email, 'reset')) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Email verification required or session expired.']);
        exit;
    }

    // 2. Hash the new password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // 3. Update password in members table (column is password_hash)
    $stmt = $pdo->prepare("UPDATE members SET password_hash = ? WHERE email = ?");
    $stmt->execute([$passwordHash, $email]);

    if ($stmt->rowCount() === 0) {
        // Also check users table (admins/contributors) - column is password
        $stmtUser = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
        $stmtUser->execute([$passwordHash, $email]);
        
        if ($stmtUser->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Account not found.']);
            exit;
        }
    }

    // 4. Clear the verification status (optional, but good practice to prevent re-use)
    // The OTPService->isVerified check prevents it anyway, but we could mark the code as 'expired' manually.

    echo json_encode(['status' => 'success', 'message' => 'Password reset successfully. Please log in with your new password.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
