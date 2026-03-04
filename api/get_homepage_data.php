<?php
// api/get_homepage_data.php
require_once 'db.php';

require_once 'services/CacheService.php';

header("Content-Type: application/json");
// Note: CORS handled centrally by db.php — no wildcard needed here.

session_start();
$isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

$cache = new CacheService(1800); // 30 min TTL
$cacheKey = 'homepage_data_public';
$isLocal = php_sapi_name() === 'cli-server' || $_SERVER['SERVER_NAME'] === '127.0.0.1' || $_SERVER['SERVER_NAME'] === 'localhost';

if (!$isAdmin && !$isLocal) {
    // Add HTTP-level caching for public users (30 min)
    header('Cache-Control: public, max-age=1800');
    $cachedData = $cache->get($cacheKey);
    if ($cachedData) {
        // ETag: Generate a hash of the cached content for conditional requests.
        // If the client sends a matching If-None-Match header, return 304 (no body).
        $etag = '"' . md5($cachedData) . '"';
        header('ETag: ' . $etag);
        if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] === $etag) {
            http_response_code(304);
            exit;
        }
        echo $cachedData;
        exit;
    }
} else {
    // No caching for admins — they need live data
    header('Cache-Control: no-store, no-cache, must-revalidate');
}

try {
    // DB Agnostic Date (UTC)
    $currentDate = gmdate('Y-m-d');
    $currentDateTime = gmdate('Y-m-d H:i:s');

    // 1. Fetch Featured Blog (Latest 1)
    $featuredSql = "SELECT b.*,
                   CASE
                     WHEN u.role = 'admin' OR b.author_id IS NULL THEN 'Raghu Boddu'
                     ELSE COALESCE(c.full_name, b.author)
                   END AS author_name,
                   CASE
                     WHEN u.role = 'admin' OR b.author_id IS NULL THEN '/assets/raghu_boddu.png'
                     ELSE COALESCE(c.image, '/assets/placeholder.webp')
                   END AS author_image,
                   CASE
                     WHEN u.role = 'admin' OR b.author_id IS NULL THEN COALESCE(u.bio, 'Founder & Security Expert at SAP Security Expert. Author of books on SAP Access Control, Process Control, and IAG.')
                     ELSE COALESCE(c.short_bio, 'Contributor')
                   END AS author_bio,
        (SELECT COUNT(*) FROM comments c2 WHERE c2.post_id = b.slug AND c2.status = 'approved') AS comment_count
        FROM blogs b 
        LEFT JOIN users u ON b.author_id = u.id
        LEFT JOIN contributors c ON u.contributor_id = c.id
        WHERE b.status IN ('approved', 'published') AND b.date <= ?
        ORDER BY b.created_at DESC LIMIT 1";
    
    $stmt = $pdo->prepare($featuredSql);
    $stmt->execute([$currentDate]);
    $featured = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Fetch Recent Blogs (Next 3, excluding featured)
    $recent = [];
    $recentParams = [];
    $sql = "SELECT b.*,
                   CASE
                     WHEN u.role = 'admin' OR b.author_id IS NULL THEN 'Raghu Boddu'
                     ELSE COALESCE(c.full_name, b.author)
                   END AS author_name,
                   CASE
                     WHEN u.role = 'admin' OR b.author_id IS NULL THEN '/assets/raghu_boddu.png'
                     ELSE COALESCE(c.image, '/assets/placeholder.webp')
                   END AS author_image,
                   CASE
                     WHEN u.role = 'admin' OR b.author_id IS NULL THEN COALESCE(u.bio, 'Founder & Security Expert at SAP Security Expert. Author of books on SAP Access Control, Process Control, and IAG.')
                     ELSE COALESCE(c.short_bio, 'Contributor')
                   END AS author_bio
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            LEFT JOIN contributors c ON u.contributor_id = c.id
            WHERE b.status = 'approved' AND b.date <= ?";
    $recentParams[] = $currentDate;

    if ($featured) {
        $sql .= " AND b.id != ?";
        $recentParams[] = $featured['id'];
    }
    
    $sql .= " ORDER BY b.created_at DESC LIMIT 3";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($recentParams);
    $recent = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Fetch All Approved Contributors
    // Note: 'created_at' is used as 'joined date'.
    $stmt = $pdo->query("SELECT id, full_name, role, image AS profile_image, created_at FROM contributors WHERE status = 'approved' ORDER BY created_at DESC");
    $contributors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = json_encode([
        'status' => 'success',
        'featured' => $featured,
        'recent' => $recent,
        'contributors' => $contributors
    ]);

    if (!$isAdmin && !$isLocal) {
        $cache->set($cacheKey, $response);
    } else {
        // Force refresh for admins/local to clear any stale cache
        $cache->invalidate($cacheKey);
    }

    echo $response;

} catch (PDOException $e) {
    error_log('[get_homepage_data] DB Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to load homepage data. Please try again.']);
}
?>
