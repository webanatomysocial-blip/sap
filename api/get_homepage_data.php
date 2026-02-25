<?php
// api/get_homepage_data.php
require_once 'db.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

session_start();
$isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

try {
    // DB Agnostic Date (Works for MySQL and SQLite)
    $currentDate = date('Y-m-d');

    // 1. Fetch Featured Blog (Latest 1)
    $featuredSql = "SELECT b.*,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = b.slug AND c.status = 'approved') AS comment_count
        FROM blogs b WHERE b.status = 'published'";
    $featuredParams = [];
    
    if (!$isAdmin) {
        $featuredSql .= " AND (b.date <= ? OR b.date IS NULL)";
        $featuredParams[] = $currentDate;
    }
    
    $featuredSql .= " ORDER BY b.date DESC LIMIT 1";
    
    $stmt = $pdo->prepare($featuredSql);
    $stmt->execute($featuredParams);
    $featured = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Fetch Recent Blogs (Next 4, excluding featured)
    // Fix: Exclude empty titles/slugs and the featured blog ID
    $recent = [];
    $excludeId = $featured ? $featured['id'] : '';
    
    $sql = "SELECT * FROM blogs WHERE status = 'published' AND (title IS NOT NULL AND title != '') AND (slug IS NOT NULL AND slug != '')";
    $params = [];

    if (!$isAdmin) {
        $sql .= " AND (date <= ? OR date IS NULL)";
        $params[] = $currentDate;
    }

    if ($featured) {
        $sql .= " AND id != ?";
        $params[] = $featured['id'];
    }
    
    // Sort by published date — respects user-set dates (e.g., Jan 25 blog)
    $sql .= " ORDER BY date DESC LIMIT 4";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $recent = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Fetch Top 3 Approved Contributors
    // Note: 'created_at' is used as 'joined date'.
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
