<?php
/**
 * api/member_signup.php
 * POST — Public member registration. Status starts as 'pending'.
 * Admin must approve before the member can log in.
 */
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$input    = json_decode(file_get_contents('php://input'), true) ?? [];
$name     = trim($input['name']     ?? '');
$phone    = trim($input['phone']    ?? '');
$email    = trim($input['email']    ?? '');
$location = trim($input['location'] ?? '');
$company  = trim($input['company_name'] ?? '');
$role     = trim($input['job_role'] ?? '');
$password = $input['password'] ?? '';

// Basic validation
if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Name, email and password are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please enter a valid email address.']);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters.']);
    exit;
}

try {
    // Check duplicate email
    $check = $pdo->prepare("SELECT id, status FROM members WHERE email = ? LIMIT 1");
    $check->execute([$email]);
    $existing = $check->fetch();

    if ($existing) {
        if ($existing['status'] === 'pending') {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'Your signup request is already on our waitlist and pending admin approval.']);
        } elseif ($existing['status'] === 'approved') {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'This email is already registered. Please log in.']);
        } else {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'This email was previously rejected. Contact the administrator.']);
        }
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO members (name, phone, email, location, company_name, job_role, password_hash, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    ");
    $stmt->execute([$name, $phone, $email, $location, $company, $role, $hash]);

    echo json_encode([
        'status'  => 'success',
        'message' => 'You have been added to our community waitlist! An admin will review your profile and approve your membership shortly.',
    ]);

} catch (Exception $e) {
    error_log('[member_signup] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
