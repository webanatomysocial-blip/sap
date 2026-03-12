<?php
/**
 * api/member_login.php
 * POST — Member authentication. Only approved members can log in.
 */
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$input    = json_decode(file_get_contents('php://input'), true) ?? [];
$email    = trim($input['email']    ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email and password are required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM members WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $member = $stmt->fetch();

    if (!$member || !password_verify($password, $member['password_hash'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
        exit;
    }

    if ($member['status'] === 'pending') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Your account is pending admin approval. Please wait.']);
        exit;
    }

    if ($member['status'] === 'rejected') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Your account has been rejected. Contact the administrator.']);
        exit;
    }

    // Generate a simple session token (stored client-side)
    $token = bin2hex(random_bytes(32));

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['member_logged_in'] = true;
    $_SESSION['member_id'] = $member['id'];
    $_SESSION['member_email'] = $member['email'];
    $_SESSION['member_name'] = $member['name'];

    echo json_encode([
        'status'  => 'success',
        'message' => 'Login successful',
        'token'   => $token,
        'member'  => [
            'id'            => $member['id'],
            'name'          => $member['name'],
            'email'         => $member['email'],
            'phone'         => $member['phone'],
            'location'      => $member['location'],
            'company_name'  => $member['company_name'],
            'job_role'      => $member['job_role'],
            'profile_image' => $member['profile_image'] ?? null,
        ],
    ]);

} catch (Exception $e) {
    error_log('[member_login] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error. Please try again.']);
}
?>
