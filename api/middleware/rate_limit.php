<?php
/**
 * api/middleware/rate_limit.php
 * File-based IP rate limiter.
 *
 * Usage:
 *   require_once __DIR__ . '/../middleware/rate_limit.php';
 *   rateLimit('comment', 5, 60); // 5 requests per IP per 60 seconds
 *
 * - Always bypassed on localhost / 127.0.0.1 (dev environment).
 * - Silently skips enforcement if cache dir is not writable.
 * - Returns HTTP 429 JSON and exits if rate exceeded.
 *
 * Rollback: Remove require_once lines from save_comment.php and apply_contributor.php.
 */

function rateLimit(string $action, int $limit, int $windowSeconds): void
{
    // Bypass entirely in local development
    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    if (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false) {
        return;
    }

    // Determine client IP
    // Use REMOTE_ADDR exclusively. HTTP_CLIENT_IP and HTTP_X_FORWARDED_FOR are
    // user-controllable headers that can be spoofed to bypass rate limiting.
    // If behind a trusted reverse proxy (e.g. nginx), configure REMOTE_ADDR
    // to be set correctly at the proxy level instead.
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    $cacheDir  = __DIR__ . '/../cache';
    $cacheFile = $cacheDir . '/rl_' . md5($action . '_' . $ip) . '.json';

    // Skip silently if cache dir is not writable
    if (!is_dir($cacheDir) || !is_writable($cacheDir)) {
        return;
    }

    $now    = time();
    $window = [];

    // Load existing window entries
    if (file_exists($cacheFile)) {
        $raw = @file_get_contents($cacheFile);
        if ($raw !== false) {
            $window = json_decode($raw, true) ?: [];
        }
    }

    // Prune entries outside the current window
    $window = array_filter($window, fn($ts) => ($now - $ts) < $windowSeconds);

    // Check limit
    if (count($window) >= $limit) {
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        http_response_code(429);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Too many requests. Please wait before trying again.'
        ]);
        exit;
    }

    // Record this request
    $window[] = $now;
    @file_put_contents($cacheFile, json_encode(array_values($window)));
}
?>
