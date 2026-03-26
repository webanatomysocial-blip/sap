<?php
$url = 'http://localhost/sap-security-expert-new/api/send_otp.php';
$data = ['email' => 'testing@gmail.com', 'type' => 'signup'];
$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo "Result: $result\n";
echo "Headers: " . print_r($http_response_header, true);
