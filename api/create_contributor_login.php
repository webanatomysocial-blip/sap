<?php
/**
 * POST /api/admin/create-contributor-login
 * Admin creates a login account for an approved contributor.
 */
require_once 'db.php';
require_once 'auth_check.php';
require_once 'permission_check.php';

header('Content-Type: application/json');

// Admin only
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$contributorId = (int)($input['contributor_id'] ?? 0);
$username      = trim($input['username'] ?? '');
$password      = $input['password'] ?? '';
$permissions   = $input['permissions'] ?? [];

// Validate
if (!$contributorId || empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'contributor_id, username, and password are required']);
    exit;
}
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters']);
    exit;
}

try {
    // Verify contributor exists and get their info
    $stmt = $pdo->prepare("SELECT id, full_name, email FROM contributors WHERE id = ?");
    $stmt->execute([$contributorId]);
    $contributorInfo = $stmt->fetch();
    if (!$contributorInfo) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Contributor not found']);
        exit;
    }

    $email = $contributorInfo['email'];
    $name  = $contributorInfo['full_name'];

    // Ensure contributor does not already have a login in users table
    $stmt = $pdo->prepare("SELECT id FROM users WHERE contributor_id = ?");
    $stmt->execute([$contributorId]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'This contributor already has a login account']);
        exit;
    }

    // Ensure username is unique (auto-append random numbers if taken)
    $maxTries = 5;
    $baseUsername = $username;
    $usernameTaken = true;

    for ($i = 0; $i < $maxTries; $i++) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if (!$stmt->fetch()) {
            $usernameTaken = false;
            break;
        }
        // Append random 4-digit number
        $username = $baseUsername . '_' . rand(1000, 9999);
    }

    if ($usernameTaken) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Username is already taken and could not be auto-generated uniquely']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert/Update User and Member in a transaction
    $pdo->beginTransaction();

    // 1. Insert into users
    $stmt = $pdo->prepare(
        "INSERT INTO users (username, password, role, contributor_id, email, full_name, is_active)
         VALUES (?, ?, 'contributor', ?, ?, ?, 1)"
    );
    $stmt->execute([$username, $hashedPassword, $contributorId, $email, $name]);
    $newUserId = (int)$pdo->lastInsertId();

    // 2. Insert/Update permissions
    $canBlogs         = isset($permissions['can_manage_blogs'])         && $permissions['can_manage_blogs']         ? 1 : 0;
    $canAds           = isset($permissions['can_manage_ads'])           && $permissions['can_manage_ads']           ? 1 : 0;
    $canComments      = isset($permissions['can_manage_comments'])      && $permissions['can_manage_comments']      ? 1 : 0;
    $canAnnouncements = isset($permissions['can_manage_announcements']) && $permissions['can_manage_announcements'] ? 1 : 0;
    $canReview        = isset($permissions['can_review_blogs'])         && $permissions['can_review_blogs']         ? 1 : 0;

    $stmt = $pdo->prepare(
        "INSERT INTO user_permissions
         (user_id, can_manage_blogs, can_manage_ads, can_manage_comments, can_manage_announcements, can_review_blogs)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$newUserId, $canBlogs, $canAds, $canComments, $canAnnouncements, $canReview]);

    // 3. Sync to members table: ensure this contributor is also an approved member
    $checkMember = $pdo->prepare("SELECT id FROM members WHERE email = ?");
    $checkMember->execute([$email]);
    $memberRow = $checkMember->fetch();

    if ($memberRow) {
        // Update existing member: ensure same password and approved status
        $stmt = $pdo->prepare("UPDATE members SET password_hash = ?, status = 'approved', name = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $name, $memberRow['id']]);
    } else {
        // Create new approved member
        $stmt = $pdo->prepare("INSERT INTO members (name, email, password_hash, status, approved_at) VALUES (?, ?, ?, 'approved', ?)");
        $stmt->execute([$name, $email, $hashedPassword, date('Y-m-d H:i:s')]);
    }

    $pdo->commit();

    // Send notification email
    require_once 'services/NotificationService.php';
    $ns = new NotificationService();
    $credentials = [
        'username' => $username,
        'password' => $password
    ];
    $ns->notifyContributorApproved($email, $name, $credentials);

    echo json_encode([
        'status'  => 'success',
        'message' => 'Contributor login created and synced with member account successfully',
        'user_id' => $newUserId,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal error: ' . $e->getMessage()]);
}
?>
