<?php
/**
 * test_endpoints.php
 * Script to test API endpoints locally.
 */
require_once 'api/db.php';

$endpoints = [
    '/api/posts',
    '/api/get_categories.php',
    '/api/stats/community',
    '/api/member/signup', // This should fail with 400 or 405, not 500
    '/api/comments?blog_id=test',
];

foreach ($endpoints as $path) {
    echo "Testing $path: ";
    try {
        // We use curl to hit our local server (router.php handles it)
        $url = "http://localhost:5173$path"; // Assuming local dev server
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true); // We only care about status code
        curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        echo "$code\n";
        curl_close($ch);
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
