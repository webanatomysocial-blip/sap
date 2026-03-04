<?php
$isLocal = strpos($_SERVER['HTTP_HOST'] ?? 'localhost', 'localhost') !== false || strpos($_SERVER['HTTP_HOST'] ?? '', '127.0.0.1') !== false;
$uploadDir = $isLocal ? __DIR__ . '/../public/uploads/contributors/' : __DIR__ . '/../uploads/contributors/';
echo "Upload dir: " . $uploadDir . "\n";
echo "Resolved: " . realpath($uploadDir) . "\n";
