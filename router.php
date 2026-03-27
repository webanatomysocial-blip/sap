<?php

// Extract path for all routing decisions
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// If the requested file exists, serve it directly (CLI server only)
if (php_sapi_name() === 'cli-server') {
    $fullPath = __DIR__ . $path;

    if ($path !== '/' && file_exists($fullPath) && !is_dir($fullPath)) {
        return false; // Serve static file directly
    }

    // Also check in /dist folder for built assets (Vite build)
    $distPath = __DIR__ . '/dist' . $path;
    if ($path !== '/' && file_exists($distPath) && !is_dir($distPath)) {
        // Correct MIME types for built assets
        $ext = pathinfo($distPath, PATHINFO_EXTENSION);
        $mimeTypes = [
            'js' => 'application/javascript',
            'css' => 'text/css',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'svg' => 'image/svg+xml',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
            'ico' => 'image/x-icon',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf'
        ];

        if (isset($mimeTypes[$ext])) {
            header('Content-Type: ' . $mimeTypes[$ext]);
        } else {
            header('Content-Type: ' . (mime_content_type($distPath) ?: 'application/octet-stream'));
        }

        readfile($distPath);
        exit;
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
