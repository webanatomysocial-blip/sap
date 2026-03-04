<?php
// api/debug_headers.php
require_once 'db.php';
require_once 'auth_check.php';

echo json_encode([
    'getallheaders' => function_exists('getallheaders') ? getallheaders() : 'NOT_FOUND',
    'SERVER' => $_SERVER,
    'SESSION_CSRF' => $_SESSION['csrf_token'] ?? 'MISSING'
]);
