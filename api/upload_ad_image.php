<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Handle ad image upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Please select an ad image to upload.'
        ]);
        exit;
    }

    $file = $_FILES['image'];
    $zone = $_POST['zone'] ?? 'unknown';

    // Use same structure as blog images
    $isLocal = strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false || strpos($_SERVER['HTTP_HOST'] ?? '', '127.0.0.1') !== false;
    $uploadDir = $isLocal ? __DIR__ . '/../public/uploads/ads/' : __DIR__ . '/../uploads/ads/';
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    $fileType = mime_content_type($file['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Please upload a valid image file (JPG, PNG, WEBP, or GIF).'
        ]);
        exit;
    }

    // Validate file size (max 2MB for ads)
    if ($file['size'] > 2 * 1024 * 1024) {
        echo json_encode([
            'status' => 'error',
            'message' => 'The ad image is too large. Please upload an image smaller than 2MB.'
        ]);
        exit;
    }

    // Validate image dimensions based on zone
    list($width, $height) = getimagesize($file['tmp_name']);
    
    // We expect ads to be square (1:1 ratio) and at least 300x300 px for crisp quality.
    $minWidth = 300;
    $minHeight = 300;

    if ($width < $minWidth || $height < $minHeight) {
        echo json_encode([
            'status' => 'error',
            'message' => "The image is too small. It must be at least {$minWidth}x{$minHeight} pixels for high quality display."
        ]);
        exit;
    }

    // Check if the image is square (allow a very small 5% margin of error for cropping inaccuracies)
    $ratio = ($width > 0 && $height > 0) ? ($width / $height) : 0;
    if ($ratio < 0.95 || $ratio > 1.05) {
        echo json_encode([
            'status' => 'error',
            'message' => 'The ad image must be a perfectly square shape (e.g., 300x300, 600x600).'
        ]);
        exit;
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'ad_' . $zone . '_' . time() . '.' . $extension;
    $filePath = $uploadDir . $filename;

    // Check if there is an old image to delete (passed from frontend)
    $oldImage = $_POST['old_image'] ?? '';
    if (!empty($oldImage)) {
        deleteImage($oldImage);
    }

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Ad image uploaded successfully',
            'filename' => $filename,
            'path' => '/uploads/ads/' . $filename
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Something went wrong while saving your ad image. Please try again.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}
