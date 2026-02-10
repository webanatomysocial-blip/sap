<?php
// api/index.php - Central Router for SAP Security Expert
// Directs /api requests to the appropriate handlers

require_once 'db.php';

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$basePath = (rtrim($scriptName, '/') === '') ? '/api' : $scriptName;
$path = substr($requestUri, strlen($basePath));
$method = $_SERVER['REQUEST_METHOD'];

// 1. Posts API (Standardized)
if (preg_match('/^\/posts(\/([^\/]+))?/', $path, $matches)) {
    $resourceId = $matches[2] ?? null;
    if ($resourceId) {
        $_GET['id'] = $resourceId;
        $_GET['slug'] = $resourceId;
    }
    require 'manage_blogs.php';
    exit;
}

// 2. Auth API
if ($path === '/login') {
    require 'login.php';
    exit;
}

// 3. Comments API
if ($path === '/comments') {
    require 'save_comment.php';
    exit;
}

if ($path === '/admin/comments') {
    require 'manage_comments.php';
    exit;
}

// 4. Contributors API
if ($path === '/contributors/apply') {
    require 'apply_contributor.php';
    exit;
}

if ($path === '/contributors/approved') {
    require 'get_approved_contributors.php';
    exit;
}

if ($path === '/admin/contributors') {
    if ($method === 'POST') {
        require 'update_contributor_status.php';
    } else {
        require 'admin_applications.php';
    }
    exit;
}

// 5. Ads & Announcements
if ($path === '/ads' || $path === '/admin/ads') {
    require 'manage_ads.php';
    exit;
}

if ($path === '/announcements' || $path === '/admin/announcements') {
    require 'manage_announcements.php';
    exit;
}

// 6. Community Stats
if ($path === '/stats/community') {
    require 'get_community_stats.php';
    exit;
}

if ($path === '/admin/stats') {
    require 'stats.php';
    exit;
}

// 404 Fallback
http_response_code(404);
echo json_encode(["status" => "error", "message" => "Endpoint not found: $path"]);
?>
