<?php
// api/forgot_password.php
require_once 'db.php';
require_once 'services/NotificationService.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Valid email is required.']);
    exit;
}

try {
    // Check if user/admin exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? UNION SELECT id FROM members WHERE email = ?");
    $stmt->execute([$email, $email]);
    if ($stmt->fetch()) {
        $token = bin2hex(random_bytes(32));
        $hash = hash('sha256', $token);
        $expires = date('Y-m-d H:i:s', strtotime('+30 minutes'));
        
        // Store in a new table password_resets
        $pdo->exec("CREATE TABLE IF NOT EXISTS password_resets (
            email TEXT PRIMARY KEY,
            token_hash TEXT NOT NULL,
            expires_at DATETIME NOT NULL
        )");
        
        $pdo->prepare("INSERT OR REPLACE INTO password_resets (email, token_hash, expires_at) VALUES (?, ?, ?)")
            ->execute([$email, $hash, $expires]);
            
        $siteUrl = getenv('SITE_URL') ?: 'http://localhost:5173';
        $resetUrl = "$siteUrl/reset-password?token=$token&email=" . urlencode($email);
        
        $ns = new NotificationService();
        $ns->notifyPasswordReset($email, $resetUrl);
    }

    // Always return success to prevent email enumeration
    echo json_encode(['status' => 'success', 'message' => 'If this email is registered, you will receive a reset link shortly.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
