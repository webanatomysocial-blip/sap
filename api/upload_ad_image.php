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
            'message' => 'No file uploaded or upload error: ' . ($_FILES['image']['error'] ?? 'unknown')
        ]);
        exit;
    }

    $file = $_FILES['image'];
    $zone = $_POST['zone'] ?? 'unknown';

    // Flexible path detection for deployment
    // If api/ is next to assets/ (common in dist deployments), go up one level
    $uploadDir = __DIR__ . '/../assets/ads/';
    
    // If that doesn't exist, try the local dev structure (../public/assets/ads/)
    if (!is_dir($uploadDir) && !is_dir(__DIR__ . '/../assets/')) {
         $uploadDir = __DIR__ . '/../public/assets/ads/';
    }
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    $fileType = mime_content_type($file['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.'
        ]);
        exit;
    }

    // Validate file size (max 2MB for ads)
    if ($file['size'] > 2 * 1024 * 1024) {
        echo json_encode([
            'status' => 'error',
            'message' => 'File size exceeds 2MB limit.'
        ]);
        exit;
    }

    // Validate image dimensions based on zone
    list($width, $height) = getimagesize($file['tmp_name']);
    
    $expectedDimensions = [
        'home_left' => ['width' => 300, 'height' => 250],
        'home_right' => ['width' => 300, 'height' => 250],
        'sidebar' => ['width' => 300, 'height' => 600]
    ];

    if (isset($expectedDimensions[$zone])) {
        $expected = $expectedDimensions[$zone];
        // Allow 10% tolerance
        $widthOk = abs($width - $expected['width']) <= ($expected['width'] * 0.1);
        $heightOk = abs($height - $expected['height']) <= ($expected['height'] * 0.1);
        
        if (!$widthOk || !$heightOk) {
            echo json_encode([
                'status' => 'error',
                'message' => "Image dimensions ({$width}x{$height}px) don't match required size for {$zone} ({$expected['width']}x{$expected['height']}px)"
            ]);
            exit;
        }
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'ad_' . $zone . '_' . time() . '.' . $extension;
    $filePath = $uploadDir . $filename;

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Ad image uploaded successfully',
            'filename' => $filename,
            // Return path relative to web root. 
            // If we uploaded to ../assets, path is /assets
            // If we uploaded to ../public/assets, path is /assets (since public is usually root)
            'path' => '/assets/ads/' . $filename
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to move uploaded file'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}
