<?php
// api/comments.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$db_file = __DIR__ . '/database.sqlite';
$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = new PDO("sqlite:" . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($method === 'GET') {
        $blogId = $_GET['post_id'] ?? null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        if (!$blogId) {
            echo json_encode([]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id, user_name as author, content as text, timestamp as date FROM comments WHERE post_id = :post_id ORDER BY timestamp DESC LIMIT :limit OFFSET :offset");
        $stmt->execute([':post_id' => $blogId, ':limit' => $limit, ':offset' => $offset]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get total count
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM comments WHERE post_id = :post_id");
        $countStmt->execute([':post_id' => $blogId]);
        $total = $countStmt->fetchColumn();

        echo json_encode(['comments' => $comments, 'total' => $total]);

    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Basic validation
        if (empty($input['post_id']) || empty($input['author']) || empty($input['text'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
            exit;
        }

        // Honeypot check
        if (!empty($input['website_url'])) {
             // Silently fail for spam
             echo json_encode(['status' => 'success', 'message' => 'Comment received']);
             exit;
        }

        $stmt = $pdo->prepare("INSERT INTO comments (post_id, user_name, content) VALUES (:post_id, :author, :text)");
        $stmt->execute([
            ':post_id' => $input['post_id'], 
            ':author' => $input['author'], 
            ':text' => $input['text']
        ]);

        echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId()]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
