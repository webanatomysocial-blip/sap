<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Handle blog image upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Please select an image to upload.'
        ]);
        exit;
    }

    $file = $_FILES['image'];
    $isLocal = strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false || strpos($_SERVER['HTTP_HOST'] ?? '', '127.0.0.1') !== false;
    $uploadDir = $isLocal ? __DIR__ . '/../public/uploads/blogs/' : __DIR__ . '/../uploads/blogs/';
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    $fileType = mime_content_type($file['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Please upload a valid image file (JPG, PNG, or WEBP).'
        ]);
        exit;
    }

    // Validate image dimensions and ratio
    $imageInfo = getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid image file.'
        ]);
        exit;
    }

    $width = $imageInfo[0];
    $height = $imageInfo[1];

    $type = $_POST['type'] ?? 'featured'; // Default to featured if not specified

    if ($type === 'featured') {
        if ($width < 1920 || $height < 1080) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Featured image must be at least 1920x1080 pixels.'
            ]);
            exit;
        }

        $ratio = $width / $height;
        $targetRatio = 16 / 9;
        if (abs($ratio - $targetRatio) > 0.02) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Featured image must be 16:9 ratio (minimum 1920x1080).'
            ]);
            exit;
        }
    }

    // Validate file size (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        echo json_encode([
            'status' => 'error',
            'message' => 'The image is too large. Please upload an image smaller than 5MB.'
        ]);
        exit;
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('blog_') . '_' . time() . '.' . $extension;
    $filePath = $uploadDir . $filename;

    // Check if there is an old image to delete (optional, passed from frontend)
    $oldImage = $_POST['old_image'] ?? '';
    if (!empty($oldImage)) {
        deleteImage($oldImage);
    }

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Image uploaded successfully',
            'filename' => $filename,
            'path' => '/uploads/blogs/' . $filename
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Something went wrong while saving your image. Please try again.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}
