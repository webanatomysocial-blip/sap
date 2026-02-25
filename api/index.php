<?php
// api/index.php - Central Router for SAP Security Expert
// Directs /api requests to the appropriate handlers

require_once 'db.php';

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Extract path explicitly after '/api' to prevent server root length mismatch errors
if (preg_match('/\/api(\/.*)$/', $requestUri, $matches)) {
    $path = $matches[1];
} else {
    $path = $requestUri; // Fallback
}
$method = $_SERVER['REQUEST_METHOD'];

// 0. Upload Handlers
if ($path === '/upload_blog_image.php' || $path === '/upload-blog-image') {
    require __DIR__ . '/upload_blog_image.php';
    exit;
}

if ($path === '/upload_ad_image.php' || $path === '/upload-ad-image') {
    require __DIR__ . '/upload_ad_image.php';
    exit;
}

// 1. Posts API (Standardized)
if (preg_match('/^\/posts(\/([^\/]+))?/', $path, $matches)) {
    $resourceId = $matches[2] ?? null;
    if ($resourceId) {
        $_GET['id'] = $resourceId;
        $_GET['slug'] = $resourceId;
    }
    require __DIR__ . '/manage_blogs.php';
    exit;
}

// 2. Auth API
if ($path === '/login') {
    require __DIR__ . '/login.php';
    exit;
}

// 3. Comments API
if ($path === '/comments') {
    require __DIR__ . '/save_comment.php';
    exit;
}

if ($path === '/admin/comments') {
    require __DIR__ . '/manage_comments.php';
    exit;
}

// 4. Contributors API
if ($path === '/contributors/apply') {
    require __DIR__ . '/apply_contributor.php';
    exit;
}

if ($path === '/contributors/approved') {
    require __DIR__ . '/get_approved_contributors.php';
    exit;
}

if ($path === '/admin/contributors') {
    if ($method === 'POST') {
        require __DIR__ . '/update_contributor_status.php';
    } else {
        require __DIR__ . '/admin_applications.php';
    }
    exit;
}

// 5. Ads & Announcements
if ($path === '/ads' || $path === '/admin/ads') {
    require __DIR__ . '/manage_ads.php';
    exit;
}

if ($path === '/announcements' || $path === '/admin/announcements') {
    require __DIR__ . '/manage_announcements.php';
    exit;
}

// 6. Community Stats
if ($path === '/stats/community') {
    require __DIR__ . '/get_community_stats.php';
    exit;
}

if ($path === '/admin/stats') {
    require __DIR__ . '/stats.php';
    exit;
}

// 7. Views API
if ($path === '/views') {
    require __DIR__ . '/save_view.php';
    exit;
}

// 404 Fallback
http_response_code(404);
echo json_encode(["status" => "error", "message" => "Endpoint not found: $path"]);
?>
