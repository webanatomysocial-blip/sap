<?php
/**
 * POST /api/admin/profile/update
 * Updates admin profile (name, email, image).
 */
require_once 'db.php';
require_once 'auth_check.php';
require_once 'utils.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$adminId = $_SESSION['admin_id'];
$fullName = $_POST['full_name'] ?? '';
$email = $_POST['email'] ?? '';

if (empty($fullName) || empty($email)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Full name and email are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
    exit;
}

try {
    // Check if email is already taken by another admin
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $adminId]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email is already in use']);
        exit;
    }

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

        $width = $fileInfo[0];
        $height = $fileInfo[1];
        $mime = $fileInfo['mime'];
        $allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

        // 1. MIME Validation
        if (!in_array($mime, $allowedMime)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid image type. Allowed: jpeg, png, webp']);
            exit;
        }

        // 2. Size Validation (2MB)
        if ($fileSize > 2 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Image size must be less than 2MB']);
            exit;
        }

        // 3. Dimensions Validation (300x300)
        if ($width < 300 || $height < 300) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Image must be at least 300x300 pixels']);
            exit;
        }

        // 4. Ratio Validation (Relaxed tolerance)
        if (abs($width - $height) > 50) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Image should be approximately square (max 50px difference)']);
            exit;
        }

        // 5. Save Image
        $isLocal = (getenv('DB_CONNECTION') === 'sqlite' || !isset($_ENV['DB_CONNECTION']) || $_ENV['DB_CONNECTION'] === 'sqlite');
        $uploadDir = $isLocal ? __DIR__ . '/../public/uploads/contributors/' : __DIR__ . '/../uploads/contributors/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        if (empty($extension)) {
            $extension = explode('/', $mime)[1];
        }
        $filename = 'admin_' . uniqid() . '_' . time() . '.' . $extension;
        $targetPath = $uploadDir . $filename;

        if (move_uploaded_file($tmpPath, $targetPath)) {
            // Store relative path for frontend usage (always /uploads/...)
            $profileImage = '/uploads/contributors/' . $filename;
            
            // Delete old image
            $stmt = $pdo->prepare("SELECT profile_image FROM users WHERE id = ?");
            $stmt->execute([$adminId]);
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

    // Extract fields
    $bio = $_POST['bio'] ?? null;
    $designation = $_POST['designation'] ?? null;
    $linkedin = $_POST['linkedin'] ?? null;
    $twitter_handle = $_POST['twitter_handle'] ?? null;
    $personal_website = $_POST['personal_website'] ?? null;

    // Update Database
    $role = $_SESSION['role'] ?? 'user';
    $isContributor = $role === 'contributor';
    $contributorId = null;

    if ($isContributor) {
        $stmt = $pdo->prepare("SELECT contributor_id FROM users WHERE id = ?");
        $stmt->execute([$adminId]);
        $contributorId = $stmt->fetchColumn();
    }
    
    // Prepare User Update
    $userUpdates = [];
    $userParams = [];

    // 1. Admin/User role can update name, email, and metadata. Contributors are LOCKED for name/email.
    if (!$isContributor) {
        $userUpdates[] = "full_name = ?";
        $userParams[] = $fullName;
        $userUpdates[] = "email = ?";
        $userParams[] = $email;
        if ($bio !== null) {
            $userUpdates[] = "bio = ?";
            $userParams[] = $bio;
        }
        if ($designation !== null) {
            $userUpdates[] = "designation = ?";
            $userParams[] = $designation;
        }
        if ($linkedin !== null) {
            $userUpdates[] = "linkedin = ?";
            $userParams[] = $linkedin;
        }
        if ($twitter_handle !== null) {
            $userUpdates[] = "twitter_handle = ?";
            $userParams[] = $twitter_handle;
        }
        if ($personal_website !== null) {
            $userUpdates[] = "personal_website = ?";
            $userParams[] = $personal_website;
        }
    }

    // 2. Profile Image Sync
    if ($profileImage) {
        $userUpdates[] = "profile_image = ?";
        $userParams[] = $profileImage;
        $userUpdates[] = "avatar = ?";
        $userParams[] = $profileImage;
    }

    // 3. Timestamp
    $isSqlite = (getenv('DB_CONNECTION') === 'sqlite' || !isset($_ENV['DB_CONNECTION']) || $_ENV['DB_CONNECTION'] === 'sqlite');
    if ($isSqlite) {
        $userUpdates[] = "updated_at = CURRENT_TIMESTAMP";
    } else {
        $userUpdates[] = "updated_at = CURRENT_TIMESTAMP";
    }

    // 4. Execute User Updates
    if (!empty($userUpdates)) {
        $sql = "UPDATE users SET " . implode(', ', $userUpdates) . " WHERE id = ?";
        $userParams[] = $adminId;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($userParams);
    }

    // 5. Contributor Profile Sync (Metadata)
    if ($isContributor && $contributorId) {
        $contribUpdates = [];
        $contribParams = [];

        if ($profileImage) {
            $contribUpdates[] = "image = ?";
            $contribParams[] = $profileImage;
        }
        if ($bio !== null) {
            $contribUpdates[] = "short_bio = ?";
            $contribParams[] = $bio;
        }
        if ($designation !== null) {
            $contribUpdates[] = "designation = ?";
            $contribParams[] = $designation;
        }
        if ($linkedin !== null) {
            $contribUpdates[] = "linkedin = ?";
            $contribParams[] = $linkedin;
        }
        if ($twitter_handle !== null) {
            $contribUpdates[] = "twitter_handle = ?";
            $contribParams[] = $twitter_handle;
        }
        if ($personal_website !== null) {
            $contribUpdates[] = "personal_website = ?";
            $contribParams[] = $personal_website;
        }

        if (!empty($contribUpdates)) {
            $sql = "UPDATE contributors SET " . implode(', ', $contribUpdates) . " WHERE id = ?";
            $contribParams[] = $contributorId;
            $stmt = $pdo->prepare($sql);
            $stmt->execute($contribParams);
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Profile updated successfully',
        'profile_image' => $profileImage 
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal Server Error: ' . $e->getMessage()]);
}
?>
