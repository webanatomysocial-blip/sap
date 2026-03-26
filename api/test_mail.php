<?php
// api/test_mail.php
require_once 'db.php'; // Loads .env
require_once 'services/MailService.php';

$mailService = MailService::getInstance();

// Mock template if not exists
$templateDir = __DIR__ . '/templates';
if (!is_dir($templateDir)) {
    mkdir($templateDir, 0777, true);
}

$testTemplate = $templateDir . '/test.html';
file_put_contents($testTemplate, "<h1>Test Email</h1><p>Hello {{name}}, this is a test from SAP Security Expert.</p>");

$result = $mailService->send('nitish.vetcha@mosol9.in', 'SMTP Test Connection', 'test', ['name' => 'Admin']);

if ($result) {
    echo "SUCCESS: Email sent successfully!\n";
} else {
    echo "FAILURE: Could not send email. Check logs.\n";
}
?>
