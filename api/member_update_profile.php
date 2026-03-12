<?php
/**
 * api/member_update_profile.php
 * POST — Updates member profile (name, phone, location, profile_image).
 */
require_once 'db.php';
require_once 'utils.php';

header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 1. Authentication Check
if (!isset($_SESSION['member_logged_in']) || $_SESSION['member_logged_in'] !== true || !isset($_SESSION['member_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Please log in.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$memberId = $_SESSION['member_id'];
$name     = trim($_POST['name'] ?? '');
$phone    = trim($_POST['phone'] ?? '');
$location = trim($_POST['location'] ?? '');
$company  = trim($_POST['company_name'] ?? '');
$jobRole  = trim($_POST['job_role'] ?? '');

if (empty($name)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Name is required']);
    exit;
}

try {
    // Handle Image Upload
    $profileImage = null;
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['profile_image'];
        $tmpPath = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileInfo = getimagesize($tmpPath);
        
        if (!$fileInfo) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid image file']);
            exit;
        }

        $width  = $fileInfo[0];
        $height = $fileInfo[1];
        $mime   = $fileInfo['mime'];
        $allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

        if (!in_array($mime, $allowedMime)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid image type. Allowed: jpeg, png, webp']);
            exit;
        }

        if ($fileSize > 2 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Image size must be less than 2MB']);
            exit;
        }

        // Save Image
        $isLocal = (getenv('DB_CONNECTION') === 'sqlite' || !isset($_ENV['DB_CONNECTION']) || $_ENV['DB_CONNECTION'] === 'sqlite');
        $uploadDir = $isLocal ? __DIR__ . '/../public/uploads/members/' : __DIR__ . '/../uploads/members/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        if (empty($extension)) {
            $extension = explode('/', $mime)[1];
        }
        $filename = 'member_' . $memberId . '_' . time() . '.' . $extension;
        $targetPath = $uploadDir . $filename;

        if (move_uploaded_file($tmpPath, $targetPath)) {
            $profileImage = '/uploads/members/' . $filename;
            
            // Delete old image
            $stmt = $pdo->prepare("SELECT profile_image FROM members WHERE id = ?");
            $stmt->execute([$memberId]);
            $oldImage = $stmt->fetchColumn();
            if ($oldImage) {
                deleteImage($oldImage);
            }
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to save image']);
            exit;
        }
    }

    // Update Database
    $updates = ["name = ?", "phone = ?", "location = ?", "company_name = ?", "job_role = ?"];
    $params  = [$name, $phone, $location, $company, $jobRole];

    if ($profileImage) {
        $updates[] = "profile_image = ?";
        $params[]  = $profileImage;
    }

    $sql = "UPDATE members SET " . implode(', ', $updates) . " WHERE id = ?";
    $params[] = $memberId;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Update session
    $_SESSION['member_name'] = $name;

    echo json_encode([
        'status'  => 'success',
        'message' => 'Profile updated successfully',
        'member'  => [
            'id'            => $memberId,
            'name'          => $name,
            'email'         => $_SESSION['member_email'],
            'phone'         => $phone,
            'location'      => $location,
            'company_name'  => $company,
            'job_role'      => $jobRole,
            'profile_image' => $profileImage ?? ($_POST['current_image'] ?? null),
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server Error: ' . $e->getMessage()]);
}
?>
