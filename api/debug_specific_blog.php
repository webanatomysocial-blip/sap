<?php
require_once 'db.php';
header('Content-Type: application/json');

try {
    $response = [];

    // Find "SEO Test Blog"
    $stmt = $pdo->prepare("SELECT id, title, slug, category FROM blogs WHERE title LIKE ?");
    $stmt->execute(['%SEO Test Blog%']);
    $response['seo_test_blog'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Find potential "empty" blogs
    $stmt = $pdo->query("SELECT id, title, slug, date FROM blogs WHERE title IS NULL OR title = '' OR slug IS NULL OR slug = ''");
    $response['empty_blogs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get Recent 5 again to see the first one
    $stmt = $pdo->query("SELECT id, title, slug, date FROM blogs ORDER BY date DESC LIMIT 5");
    $response['recent_blogs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
