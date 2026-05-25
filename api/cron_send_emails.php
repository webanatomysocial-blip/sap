<?php
// api/cron_send_emails.php
// Runs every minute via cPanel Cron
// Process 12 emails, wait 5 seconds between each

if (php_sapi_name() !== 'cli') {
    // Basic security if accessed via web
    $secret = $_GET['secret'] ?? '';
    $expected = getenv('CRON_SECRET');
    if (empty($expected) || $secret !== $expected) {
        http_response_code(403);
        die("Unauthorized");
    }
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/services/MailService.php';

// Concurrency lock
$lockFile = sys_get_temp_dir() . '/sap_mail_queue.lock';
$fp = fopen($lockFile, 'w+');

if (!flock($fp, LOCK_EX | LOCK_NB)) {
    die("Cron already running.\n");
}

try {
    $mailService = MailService::getInstance();

    // 1. Fetch up to 12 pending emails
    $stmt = $pdo->prepare("SELECT id, recipient, subject, body, attempts FROM email_queue WHERE status = 'pending' ORDER BY id ASC LIMIT 12");
    $stmt->execute();
    $emails = $stmt->fetchAll();

    if (empty($emails)) {
        echo "No pending emails.\n";
        flock($fp, LOCK_UN);
        fclose($fp);
        exit;
    }

    echo "Found " . count($emails) . " pending emails. Sending at a rate of 12 per minute (5-second intervals)...\n";

    $sentCount = 0;
    $total = count($emails);
    $i = 0;

    foreach ($emails as $email) {
        $id = $email['id'];
        $to = $email['recipient'];
        $subject = $email['subject'];
        $body = $email['body'];
        $attempts = $email['attempts'] + 1;

        // Attempt to send
        $success = $mailService->sendDirect($to, $subject, $body);

        if ($success) {
            $stmtUpdate = $pdo->prepare("UPDATE email_queue SET status = 'sent', sent_at = CURRENT_TIMESTAMP, attempts = ? WHERE id = ?");
            $stmtUpdate->execute([$attempts, $id]);
            echo "Successfully sent email to $to\n";
            $sentCount++;
        } else {
            // Failed
            if ($attempts >= 3) {
                $stmtUpdate = $pdo->prepare("UPDATE email_queue SET status = 'failed', attempts = ?, error_message = 'Max attempts reached' WHERE id = ?");
            } else {
                $stmtUpdate = $pdo->prepare("UPDATE email_queue SET attempts = ? WHERE id = ?"); // stays pending
            }
            $stmtUpdate->execute([$attempts, $id]);
            echo "Failed to send email to $to (Attempt $attempts)\n";
        }

        // Sleep 5 seconds between emails to respect AWS SES limit
        // (Only sleep if there are more emails to process in this batch)
        if (++$i < $total) {
            sleep(5);
        }
    }

    echo "Cron execution complete. Sent $sentCount emails.\n";

} catch (Exception $e) {
    echo "Fatal error: " . $e->getMessage() . "\n";
} finally {
    flock($fp, LOCK_UN);
    fclose($fp);
}
?>
