require_once 'db.php';
require_once 'services/NotificationService.php';

if (session_status() === PHP_SESSION_NONE) session_start();

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    
    // CAPTCHA VALIDATION
    $captchaAns = $input['captchaAns'] ?? null;
    $captchaExpected = isset($_SESSION['captcha_ans']) ? $_SESSION['captcha_ans'] : (isset($_COOKIE['captcha_ans']) ? $_COOKIE['captcha_ans'] : null);
    
    if ($captchaAns === null || (int)$captchaAns !== (int)$captchaExpected) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid Captcha. Please try again.']);
        exit;
    }

    $name = htmlspecialchars($input['name'] ?? 'N/A');
    $email = htmlspecialchars($input['email'] ?? 'N/A');
    $message = htmlspecialchars($input['message'] ?? 'No message content');

    try {
        $ns = new NotificationService();
        $ns->notifyContactSubmission([
            'name' => $name,
            'email' => $email,
            'message' => $message
        ]);
        
        echo json_encode(["status" => "success", "message" => "Your message has been sent successfully."]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed. Use POST."]);
}
?>
