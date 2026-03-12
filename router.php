<?php

// Extract path for all routing decisions
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// If the requested file exists, serve it directly (CLI server only)
if (php_sapi_name() === 'cli-server') {
    $fullPath = __DIR__ . $path;

    if ($path !== '/' && file_exists($fullPath) && !is_dir($fullPath)) {
        return false; // Serve static file directly
    }
}

// Route API requests — direct file dispatch (e.g. /api/check_plagiarism.php)
if (strpos($path, '/api/') === 0) {
    $filePath = __DIR__ . $path;
    if ($path !== '/api/' && file_exists($filePath) && !is_dir($filePath)) {
        // Direct PHP file exists — require it
        require $filePath;
    } else {
        // Delegate to central router
        require __DIR__ . '/api/index.php';
    }
    exit;
}

// Otherwise serve frontend through index.php (to inject SEO tags)
if (file_exists(__DIR__ . '/index.php')) {
    require __DIR__ . '/index.php';
} elseif (file_exists(__DIR__ . '/index.html')) {
    require __DIR__ . '/index.html';
} else {
    echo "Frontend build missing (index.php/html not found)";
}
?>
