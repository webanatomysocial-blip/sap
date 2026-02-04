<?php
// api/stats.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$db_file = __DIR__ . '/database.sqlite';

try {
    $pdo = new PDO("sqlite:" . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Fetch views for all posts
    $stmtViews = $pdo->query("SELECT post_id, count FROM views");
    $views = $stmtViews->fetchAll(PDO::FETCH_KEY_PAIR);

    // Fetch comment counts for all posts
    $stmtComments = $pdo->query("SELECT post_id, COUNT(*) as count FROM comments GROUP BY post_id");
    $comments = $stmtComments->fetchAll(PDO::FETCH_KEY_PAIR);

    echo json_encode([
        'views' => $views,
        'comments' => $comments
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
