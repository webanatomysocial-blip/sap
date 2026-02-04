<?php
// Prevent any PHP errors/warnings from messing up the JSON response
error_reporting(0);
ini_set('display_errors', 0);

// Set proper headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log helper function
function log_message($message) {
    $entry = date('Y-m-d H:i:s') . " - " . $message . "\n";
    file_put_contents(__DIR__ . '/mail_log.txt', $entry, FILE_APPEND);
}

try {
    if (isset($_SERVER["REQUEST_METHOD"]) && $_SERVER["REQUEST_METHOD"] == "POST") {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON input.");
        }

        $name = isset($data['name']) ? htmlspecialchars($data['name']) : 'N/A';
        $email = isset($data['email']) ? htmlspecialchars($data['email']) : 'N/A';
        $subject = isset($data['subject']) ? htmlspecialchars($data['subject']) : 'New Form Submission';
        $message = isset($data['message']) ? htmlspecialchars($data['message']) : 'No message content';

        $to = "reddydheeraj2109@gmail.com";
        
        $server_domain = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost';
        $from_email = "noreply@" . $server_domain;
        
        $headers = "From: " . $from_email . "\r\n";
        $headers .= "Reply-To: " . $email . "\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        $email_body = "You have received a new message from your website form.\n\n";
        $email_body .= "Name: $name\n";
        $email_body .= "Email: $email\n";
        $email_body .= "Subject: $subject\n";
        $email_body .= "Message:\n$message\n";
        
        log_message("Attempting to send to $to from $from_email (Reply-To: $email)");

        // Try PHP mail()
        if (mail($to, $subject, $email_body, $headers)) {
            log_message("Mail accepted by PHP mail() function.");
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Email sent successfully."]);
        } else {
            // Fallback: Try using sendmail directly
            log_message("PHP mail() returned false. Trying sendmail fallback.");
            $handle = popen('/usr/sbin/sendmail -t -i', 'w');
            if ($handle) {
                fwrite($handle, "To: $to\n");
                fwrite($handle, "$headers\n");
                fwrite($handle, "Subject: $subject\n\n");
                fwrite($handle, "$email_body");
                $result = pclose($handle);
                
                if ($result === 0) {
                    log_message("Mail sent via sendmail fallback.");
                    http_response_code(200);
                    echo json_encode(["status" => "success", "message" => "Email sent via fallback."]);
                } else {
                     throw new Exception("Sendmail fallback also failed with code $result.");
                }
            } else {
                throw new Exception("Could not open sendmail pipe.");
            }
        }
    } else {
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed. Use POST."]);
    }
} catch (Exception $e) {
    log_message("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
