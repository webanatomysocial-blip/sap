<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/api/posts';
$data = '{
  "title": "A new live test",
  "slug": "a-new-live-test",
  "excerpt": "excerpt",
  "content": "<p>content</p>",
  "author": "admin",
  "category": "sap-security",
  "meta_title": "new test title",
  "meta_description": "desc"
}';
file_put_contents('php://input', $data);
ob_start();
include 'api/manage_blogs.php';
$output = ob_get_clean();
echo "Status: " . http_response_code() . "\n";
echo "Output: " . $output . "\n";
