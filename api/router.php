<?php
// api/router.php - Routing script for local PHP built-in server
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Security: Block sensitive files locally (simulating .htaccess)
if (preg_match('/\.(sql|zip|env|json|log|bak|sqlite|db|sh)$/i', $uri) || strpos($uri, '.env') !== false) {
    http_response_code(403);
    die("Access Forbidden");
}

if ($uri !== '/' && file_exists(__DIR__ . '/..' . $uri)) {
    return false; // serve the actual file
}

// Check if request is for /api/* but not an actual file
if (strpos($uri, '/api') === 0 && !file_exists(__DIR__ . '/..' . $uri)) {
    require __DIR__ . '/index.php'; // route to the API central router
} else {
    // Treat everything else as potential React route -> index.php
    require __DIR__ . '/../index.php';
}
