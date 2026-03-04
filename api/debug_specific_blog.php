<?php
require_once 'db.php';
header('Content-Type: application/json');

try {
    $response = [];

    $now = gmdate('Y-m-d H:i:s');
    // Find "SEO Test Blog" - enforce scheduling
    $stmt = $pdo->prepare("SELECT id, title, slug, category FROM blogs WHERE title LIKE ? AND (status = 'published' OR (status = 'scheduled' AND publish_date <= ?))");
    $stmt->execute(['%SEO Test Blog%', $now]);
    $response['seo_test_blog'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Find potential "empty" blogs - enforce scheduling
    $stmt = $pdo->prepare("SELECT id, title, slug, date FROM blogs WHERE (title IS NULL OR title = '' OR slug IS NULL OR slug = '') AND (status = 'published' OR (status = 'scheduled' AND publish_date <= ?))");
    $stmt->execute([$now]);
    $response['empty_blogs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get Recent 5 again - enforce scheduling
    $stmt = $pdo->prepare("SELECT id, title, slug, date FROM blogs WHERE (status = 'published' OR (status = 'scheduled' AND publish_date <= ?)) ORDER BY date DESC LIMIT 5");
    $stmt->execute([$now]);
    $response['recent_blogs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
