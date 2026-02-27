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

        // 4. Ratio Validation (0.95 to 1.05)
        $ratio = $width / $height;
        if ($ratio < 0.95 || $ratio > 1.05) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Image must be approximately square (ratio 0.95 to 1.05)']);
            exit;
        }

        // 5. Save Image
        $uploadDir = __DIR__ . '/../public/uploads/contributors/';
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
            $profileImage = '/public/uploads/contributors/' . $filename;
            
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

    // Update Database
    $sql = "UPDATE users SET full_name = ?, email = ? ";
    $params = [$fullName, $email];

    if ($profileImage) {
        $sql .= ", profile_image = ? ";
        $params[] = $profileImage;
    }

    // Handle timestamps for MySQL vs SQLite
    if (getenv('DB_CONNECTION') === 'sqlite' || !isset($_ENV['DB_CONNECTION']) || $_ENV['DB_CONNECTION'] === 'sqlite') {
        $sql .= ", updated_at = datetime('now') ";
    } else {
        $sql .= ", updated_at = NOW() ";
    }

    $sql .= " WHERE id = ?";
    $params[] = $adminId;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        'status' => 'success',
        'message' => 'Profile updated successfully',
        'profile_image' => $profileImage // Return new image path if changed
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal Server Error: ' . $e->getMessage()]);
}
?>
