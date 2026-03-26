<?php
// api/get_captcha.php
require_once 'db.php';
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) session_start();

$num1 = rand(1, 9);
$num2 = rand(1, 9);
$ans = $num1 + $num2;

$_SESSION['captcha_ans'] = $ans;
// Also set in cookie for some environments where session might be tricky
setcookie('captcha_ans', $ans, [
    'expires' => time() + 3600,
    'path' => '/',
    'samesite' => 'Lax',
    'httponly' => true
]);

echo json_encode([
    'question' => "What is $num1 + $num2?",
    'status' => 'success'
]);
?>
