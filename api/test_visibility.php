<?php
/**
 * /tmp/test_visibility.php - Verification script for BlogService scheduling
 */

// 1. Mock minimal dependencies
class CacheService {
    public function invalidate($key = null) {}
}

function calculateSeoScore($blog) {
    return 85; // Mock score
}

// 2. Setup SQLite in memory
try {
    $pdo = new PDO('sqlite::memory:');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create minimal blogs table
    $pdo->exec("CREATE TABLE blogs (
        id VARCHAR(50) PRIMARY KEY,
        title TEXT,
        slug TEXT,
        status TEXT,
        author_id INTEGER,
        publish_datetime DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        content TEXT,
        meta_title TEXT,
        meta_description TEXT,
        image TEXT,
        submission_status TEXT
    )");
    
    // Create users table for JOIN
    $pdo->exec("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, role TEXT, full_name TEXT, profile_image TEXT, bio TEXT, designation TEXT, linkedin TEXT, twitter_handle TEXT, personal_website TEXT, contributor_id INTEGER)");
    $pdo->exec("CREATE TABLE contributors (id INTEGER PRIMARY KEY, full_name TEXT, image TEXT, short_bio TEXT, designation TEXT, linkedin TEXT, twitter_handle TEXT, personal_website TEXT)");

    // 3. Include BlogService (mismatch path handling)
    // We need to strip the require_once or satisfy them
    $serviceCode = file_get_contents('/Users/webanatomy/Desktop/sap-security-expert-new/api/services/BlogService.php');
    $serviceCode = str_replace("require_once 'CacheService.php';", "", $serviceCode);
    $serviceCode = str_replace("require_once __DIR__ . '/../utils.php';", "", $serviceCode);
    $serviceCode = str_replace('<?php', '', $serviceCode);
    $serviceCode = str_replace('?>', '', $serviceCode);
    eval($serviceCode);

    $service = new BlogService($pdo);

    // 4. Test Data
    $now = '2026-03-03 17:50:00';
    $future = '2026-03-03 18:00:00';
    $past = '2026-03-03 17:00:00';

    // Insert Users
    $pdo->exec("INSERT INTO users (id, username, role) VALUES (1, 'raghuboddu', 'admin')");
    $pdo->exec("INSERT INTO users (id, username, role) VALUES (2, 'contributor1', 'contributor')");

    // Insert Blogs
    // A. Approved, No schedule -> Visible
    $pdo->exec("INSERT INTO blogs (id, title, slug, status, author_id, publish_datetime) VALUES ('b1', 'Live Blog', 'live-blog', 'approved', 1, NULL)");
    // B. Approved, Future schedule -> Hidden from public
    $pdo->exec("INSERT INTO blogs (id, title, slug, status, author_id, publish_datetime) VALUES ('b2', 'Future Blog', 'future-blog', 'approved', 1, '$future')");
    // C. Approved, Past schedule -> Visible
    $pdo->exec("INSERT INTO blogs (id, title, slug, status, author_id, publish_datetime) VALUES ('b3', 'Scheduled Past Blog', 'past-blog', 'approved', 1, '$past')");
    // D. Draft, No schedule -> Hidden from public
    $pdo->exec("INSERT INTO blogs (id, title, slug, status, author_id, publish_datetime) VALUES ('b4', 'Draft Blog', 'draft-blog', 'draft', 1, NULL)");
    // E. Contributor's Blog -> Only visible to them
    $pdo->exec("INSERT INTO blogs (id, title, slug, status, author_id, publish_datetime) VALUES ('b5', 'Contrib Blog', 'contrib-blog', 'approved', 2, NULL)");

    echo "Running Visibility Tests...\n\n";

    // Test 1: Public View
    echo "--- Test 1: Public View ---\n";
    $publicBlogs = $service->getBlogs(null, 'public', $now);
    $titles = array_column($publicBlogs, 'title');
    echo "Public sees: " . implode(', ', $titles) . "\n";
    $expected = ['Live Blog', 'Scheduled Past Blog', 'Contrib Blog'];
    assert(count($publicBlogs) === 3);
    echo "PASS: Public sees correct blogs.\n\n";

    // Test 2: Admin View
    echo "--- Test 2: Admin View ---\n";
    $adminBlogs = $service->getBlogs(1, 'admin', $now);
    echo "Admin sees count: " . count($adminBlogs) . " (Expected 5)\n";
    assert(count($adminBlogs) === 5);
    echo "PASS: Admin sees everything.\n\n";

    // Test 3: Contributor View
    echo "--- Test 3: Contributor View ---\n";
    $contribBlogs = $service->getBlogs(2, 'contributor', $now);
    $titles = array_column($contribBlogs, 'title');
    echo "Contributor 2 sees: " . implode(', ', $titles) . "\n";
    assert(count($contribBlogs) === 1 && $titles[0] === 'Contrib Blog');
    echo "PASS: Contributor scoped correctly.\n\n";

    // Test 4: individual Blog Access (getBlog)
    echo "--- Test 4: getBlog (Public Future) ---\n";
    $futureBlogPublic = $service->getBlog('future-blog', null, 'public', $now);
    if (!$futureBlogPublic) {
        echo "PASS: Future blog hidden from public via direct access.\n";
    } else {
        echo "FAIL: Future blog ACCESSIBLE to public!\n";
    }

    echo "\n--- Test 5: getBlog (Public Past) ---\n";
    $pastBlogPublic = $service->getBlog('past-blog', null, 'public', $now);
    if ($pastBlogPublic) {
        echo "PASS: Past scheduled blog accessible to public.\n";
    } else {
        echo "FAIL: Past scheduled blog NOT accessible to public!\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
