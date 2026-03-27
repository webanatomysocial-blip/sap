<?php
require_once 'api/services/MailService.php';

$ms = MailService::getInstance();
$data = ['name' => 'nitish'];
$templatePath = 'member/signup_approved';
$fullTemplatePath = __DIR__ . '/api/templates/' . $templatePath . '.html';

if (!isset($data['site_url'])) {
    $siteUrl = getenv('SITE_URL') ?: 'https://sap.kaphi.in/';
    $data['site_url'] = rtrim($siteUrl, '/');
}

$body = file_get_contents($fullTemplatePath);
echo "BEFORE REPLACING SITE_URL:\n";
echo "Search for {{site_url}}: " . (strpos($body, '{{site_url}}') !== false ? "FOUND" : "NOT FOUND") . "\n";

foreach ($data as $key => $value) {
    $body = str_replace('{{' . $key . '}}', $value, $body);
}

echo "\nAFTER REPLACING SITE_URL:\n";
echo "Search for {{site_url}}: " . (strpos($body, '{{site_url}}') !== false ? "STILL THERE" : "ALL GONE") . "\n";
echo "\nPreview of Button link:\n";
if (preg_match('/<a href="(.*?)" class="btn">/', $body, $matches)) {
    echo "Button Link: " . $matches[1] . "\n";
} else {
    echo "Button NOT found in body!\n";
}
