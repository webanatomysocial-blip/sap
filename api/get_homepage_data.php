<?php
// api/get_homepage_data.php
require_once 'db.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

try {
    // DB Agnostic Date (Works for MySQL and SQLite)
    $currentDate = date('Y-m-d');

    // 1. Fetch Featured Blog (Latest 1)
    $stmt = $pdo->prepare("SELECT * FROM blogs WHERE status = 'published' AND date <= ? ORDER BY date DESC LIMIT 1");
    $stmt->execute([$currentDate]);
    $featured = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Fetch Recent Blogs (Next 5, excluding featured)
    // Fix: Exclude empty titles/slugs
    $recent = [];
    $excludeId = $featured ? $featured['id'] : '';
    
    $sql = "SELECT * FROM blogs WHERE status = 'published' AND date <= ? AND (title IS NOT NULL AND title != '') AND (slug IS NOT NULL AND slug != '')";
    $params = [$currentDate];

    if ($featured) {
        $sql .= " AND id != ?";
        $params[] = $featured['id'];
    }
    
    $sql .= " ORDER BY date DESC LIMIT 5";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $recent = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Fetch Top 3 Approved Contributors
    // Note: 'created_at' is used as 'joined date'. 'applied_at' might be alias in some schemas, using created_at for consistency.
    $stmt = $pdo->query("SELECT full_name, role, image AS profile_image, created_at FROM contributors WHERE status = 'approved' ORDER BY created_at DESC LIMIT 3");
    $contributors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'featured' => $featured,
        'recent' => $recent,
        'contributors' => $contributors
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
