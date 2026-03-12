<?php
// api/login.php
require_once 'db.php';
require_once 'services/AuditService.php';

$audit = new AuditService($pdo);

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Please enter both username and password.']);
        exit;
    }

    try {
        $ip = $_SERVER['REMOTE_ADDR'];
        $now = time();
        $lockoutTime = 900; // 15 minutes
        $maxAttempts = 5;

        $stmt = $pdo->prepare("SELECT attempts, last_attempt FROM login_attempts WHERE ip = ?");
        $stmt->execute([$ip]);
        $attemptRecord = $stmt->fetch();

        if ($attemptRecord && $attemptRecord['attempts'] >= $maxAttempts && ($now - $attemptRecord['last_attempt']) < $lockoutTime) {
            $remaining = $lockoutTime - ($now - $attemptRecord['last_attempt']);
            $minutes = ceil($remaining / 60);
            http_response_code(429);
            echo json_encode(['status' => 'error', 'message' => "Too many login attempts. Please try again in $minutes minutes."]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {

            // HARDENING: Check is_active (if column exists)
            if (isset($user['is_active']) && $user['is_active'] == 0) {
                http_response_code(403);
                echo json_encode([
                    'status'  => 'error',
                    'message' => 'Account is deactivated. Contact administrator.',
                ]);
                exit;
            }

            // Harden session cookies before starting the session
            session_set_cookie_params([
                'lifetime' => 0,              // Session cookie (expires on browser close)
                'path'     => '/',
                'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
                'httponly' => true,           // Blocks JS access (XSS protection)
                'samesite' => 'Strict',       // Blocks cross-site request forgery
            ]);

            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // SESSION FIXATION PROTECTION: regenerate ID before writing session data
            session_regenerate_id(true);

            // Core session values
            $_SESSION['admin_id']      = $user['id'];
            $_SESSION['admin_user']    = $user['username'];
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['role']          = $user['role'] ?? 'admin';
            $_SESSION['is_active']     = $user['is_active'] ?? 1;

            // Generate CSRF token
            $csrf_token = bin2hex(random_bytes(32));
            $_SESSION['csrf_token'] = $csrf_token;

            // Fetch permissions from user_permissions (if table exists)
            $permissions = [];
            try {
                $permStmt = $pdo->prepare("SELECT * FROM user_permissions WHERE user_id = ? LIMIT 1");
                $permStmt->execute([$user['id']]);
                $permRow = $permStmt->fetch();
                if ($permRow) {
                    $permissions = [
                        'can_manage_blogs'         => (bool)$permRow['can_manage_blogs'],
                        'can_manage_ads'           => (bool)$permRow['can_manage_ads'],
                        'can_manage_comments'      => (bool)$permRow['can_manage_comments'],
                        'can_manage_announcements' => (bool)$permRow['can_manage_announcements'],
                        'can_review_blogs'         => (bool)($permRow['can_review_blogs'] ?? 0),
                    ];
                }
            } catch (Exception $e) {
                // user_permissions table may not exist yet — safe fallback
                $permissions = [];
            }
            $_SESSION['permissions'] = $permissions;

            // Reset login attempts on success
            $stmt = $pdo->prepare("DELETE FROM login_attempts WHERE ip = ?");
            $stmt->execute([$ip]);

            // Audit Log Success
            $audit->log($user['id'], 'login_success', 'user', $user['id'], 'IP: ' . $ip);

            echo json_encode([
                'status'      => 'success',
                'message'     => 'Login successful',
                'csrf_token'  => $csrf_token,
                'role'        => $_SESSION['role'],
                'permissions' => $permissions,
                'user'        => [
                    'id'       => $user['id'],
                    'username' => $user['username'],
                    'role'     => $_SESSION['role'],
                    'avatar'   => $user['avatar'] ?? null,
                ],
            ]);
        } else {
            // Increment login attempts (Cross-database compatible approach)
            $checkStmt = $pdo->prepare("SELECT ip FROM login_attempts WHERE ip = ?");
            $checkStmt->execute([$ip]);
            if ($checkStmt->fetch()) {
                $stmt = $pdo->prepare("UPDATE login_attempts SET attempts = attempts + 1, last_attempt = ? WHERE ip = ?");
                $stmt->execute([$now, $ip]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO login_attempts (ip, attempts, last_attempt) VALUES (?, 1, ?)");
                $stmt->execute([$ip, $now]);
            }

            // Audit Log Failure
            $audit->log(null, 'login_failure', 'user', $username, 'IP: ' . $ip);

            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'The username or password you entered is incorrect.']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Something went wrong while connecting to the system. Please try again.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>
