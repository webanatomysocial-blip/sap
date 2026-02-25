<?php
// router.php for local PHP server

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $uri;

// 1. If it's an existing file, serve it directly
if (is_file($file)) {
    return false;
}

// Fallback for public/ directory (assets and uploads)
$publicFile = __DIR__ . '/public' . $uri;
if (is_file($publicFile)) {
    // We need to serve the file ourselves or tell PHP server about it.
    // However, if we return false, it only uses __DIR__ as root.
    // So we can try to read it.
    $mime = mime_content_type($publicFile);
    header("Content-Type: $mime");
    readfile($publicFile);
    return true;
}

// 2. If it is an API request, route to api/index.php
if (strpos($uri, '/api') === 0) {
    // Fix $_SERVER variables for api/index.php
    $_SERVER['SCRIPT_NAME'] = '/api/index.php';
    $_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/api/index.php';
    
    // We need to ensure we're inside the api directory context if the script assumes it?
    // api/index.php does "dirname($_SERVER['SCRIPT_NAME'])" which would be /api, 
    // so basePath calculation should work.
    
    require __DIR__ . '/api/index.php';
    exit;
}

// 3. Otherwise, serve index.html for React Router
// (Frontend Routing)
if (file_exists(__DIR__ . '/index.html')) {
    readfile(__DIR__ . '/index.html');
    exit;
} else {
    // Should not happen if build exists, but fallback
    http_response_code(404);
    echo "404 Not Found (index.html missing)";
}
?>
