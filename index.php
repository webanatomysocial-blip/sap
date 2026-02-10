<?php
// SAP Security Expert - SEO Wrapper & Asset Proxy
// Optimized for cPanel / MySQL

require_once __DIR__ . '/api/db.php';

// Function to ensure absolute URL
function getAbsoluteUrl($path, $baseUrl) {
    if (strpos($path, 'http') === 0) return $path;
    return rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
}

function getOptimizedOgImage($url) {
    return $url;
}

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Determine protocol and host dynamically
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'];
$baseUrl = $protocol . $host;

// Default Meta Tags
$defaultTitle = "SAP Security Expert";
$defaultDesc = "The leading community for SAP Security, GRC, and BTP professionals. Get the latest insights, tutorials, and best practices.";
$defaultKeywords = "SAP Security, SAP GRC, SAP BTP, SAP Licensing, SAP Cybersecurity, SAP IAG, SAP Public Cloud";
$defaultAbsImage = getAbsoluteUrl("/assets/sapsecurityexpert-black.png", $baseUrl);

$title = $defaultTitle;
$description = $defaultDesc;
$keywords = $defaultKeywords;
$image = $defaultAbsImage;
$url = $baseUrl . "/";
$type = "website";

// 1. Static Pages (Simplified)
$staticPages = [
    '/blogs' => ['title' => 'Blogs | SAP Security Expert', 'description' => 'Read our latest blogs on SAP Security.'],
    '/contact' => ['title' => 'Contact Us | SAP Security Expert', 'description' => 'Get in touch with us.'],
    '/podcasts' => ['title' => 'Podcasts | SAP Security Expert', 'description' => 'Listen to SAP Security insights.'],
    '/product-reviews' => ['title' => 'Product Reviews | SAP Security Expert', 'description' => 'Unbiased SAP tool reviews.'],
    '/other-tools' => ['title' => 'Other Tools | SAP Security Expert', 'description' => 'Essential SAP Security utilities.']
];

// 2. Categories mapping
$categories = [
    'sap-btp-security' => 'SAP BTP Security',
    'sap-grc' => 'SAP GRC',
    'sap-public-cloud' => 'SAP Public Cloud',
    'sap-cybersecurity' => 'SAP Cybersecurity',
    'sap-licensing' => 'SAP Licensing'
];

$cleanPath = trim($path, '/');
if ($cleanPath === "") $cleanPath = "/";
else $cleanPath = "/" . $cleanPath;

$found = false;

// Check Static Pages
if (array_key_exists($cleanPath, $staticPages)) {
    $title = $staticPages[$cleanPath]['title'];
    $description = $staticPages[$cleanPath]['description'];
    $found = true;
} 
// Check Category Pages
else if (array_key_exists(ltrim($cleanPath, '/'), $categories)) {
     $catKey = ltrim($cleanPath, '/');
     $title = $categories[$catKey] . " | SAP Security Expert";
     $description = "Expert insights and tutorials for " . $categories[$catKey] . ".";
     $found = true;
}
else {
    // Check Blog Posts in MySQL
    // Extract slug from path (e.g. /blogs/some-slug-here)
    if (preg_match('/\/blogs\/([^\/]+)/', $cleanPath, $slugMatches)) {
        $slug = $slugMatches[1];
        try {
            $stmt = $pdo->prepare("SELECT title, meta_description as description, tags as keywords, image FROM blogs WHERE slug = ? AND status = 'published' LIMIT 1");
            $stmt->execute([$slug]);
            $item = $stmt->fetch();
            
            if ($item) {
                $title = $item['title'] . " | SAP Security Expert";
                $description = $item['description'] ?: $defaultDesc;
                $keywords = $item['keywords'] ?: $defaultKeywords;
                $image = getAbsoluteUrl($item['image'], $baseUrl);
                $url = $baseUrl . "/blogs/" . $slug;
                $type = "article";
                $found = true;

                // Track View (Simple PHP side tracking)
                $pdo->prepare("UPDATE blogs SET view_count = view_count + 1 WHERE slug = ?")->execute([$slug]);
            }
        } catch (Exception $e) {
            // Silently fail to defaults if DB error
        }
    }
}

// Read index.html
$html = file_exists('index.html') ? file_get_contents('index.html') : "<!DOCTYPE html><html><head><title>SAP Security Expert</title></head><body></body></html>";

// Inject Base Tag
if (strpos($html, '<base') === false) {
    $html = str_replace('<head>', '<head><base href="/">', $html);
}

// Cleanup existing tags
$html = preg_replace('/<title>.*?<\/title>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*name=["\']description["\'][^>]*\/?>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*name=["\']keywords["\'][^>]*\/?>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*property=["\']og:[^"\']+["\'][^>]*\/?>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*name=["\']twitter:[^"\']+["\'][^>]*\/?>/is', '', $html);

// Inject New Tags
$ogTags = "
    <title>" . htmlspecialchars($title) . "</title>
    <meta name=\"description\" content=\"" . htmlspecialchars($description) . "\">
    <meta name=\"keywords\" content=\"" . htmlspecialchars($keywords) . "\">
    <meta property=\"og:title\" content=\"" . htmlspecialchars($title) . "\">
    <meta property=\"og:description\" content=\"" . htmlspecialchars($description) . "\">
    <meta property=\"og:image\" content=\"" . htmlspecialchars($image) . "\">
    <meta property=\"og:url\" content=\"" . htmlspecialchars($url) . "\">
    <meta property=\"og:type\" content=\"" . htmlspecialchars($type) . "\">
    <meta name=\"twitter:card\" content=\"summary_large_image\">
    <meta name=\"twitter:title\" content=\"" . htmlspecialchars($title) . "\">
    <meta name=\"twitter:description\" content=\"" . htmlspecialchars($description) . "\">
    <meta name=\"twitter:image\" content=\"" . htmlspecialchars($image) . "\">
";

$html = str_replace('</head>', $ogTags . "\n</head>", $html);

echo $html;
?>
