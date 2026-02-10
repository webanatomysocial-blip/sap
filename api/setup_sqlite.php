<?php
// api/setup_sqlite.php
// Script to initialize local SQLite database matching the production schema

$dbFile = __DIR__ . '/database.sqlite';

// Remove existing DB to start fresh
if (file_exists($dbFile)) {
    unlink($dbFile);
}

try {
    $pdo = new PDO("sqlite:$dbFile");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Creating SQLite database...\n";

    // 1. Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'editor',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "- Table 'users' created.\n";

    // 2. Blogs Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS blogs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT,
        author TEXT DEFAULT 'Admin',
        date DATE,
        image TEXT,
        category TEXT DEFAULT 'sap-security',
        subCategory TEXT,
        tags TEXT,
        view_count INTEGER DEFAULT 0,
        meta_title TEXT,
        meta_description TEXT,
        status TEXT DEFAULT 'published',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "- Table 'blogs' created.\n";

    // 3. Comments Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        email TEXT,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "- Table 'comments' created.\n";

    // 4. Contributors Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS contributors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        linkedin TEXT,
        country TEXT,
        organization TEXT,
        designation TEXT,
        role TEXT,
        expertise TEXT,
        other_expertise TEXT,
        years_experience TEXT,
        short_bio TEXT,
        contribution_types TEXT,
        proposed_topics TEXT,
        contributed_elsewhere TEXT,
        previous_work_links TEXT,
        preferred_frequency TEXT,
        primary_motivation TEXT,
        weekly_time TEXT,
        volunteer_events TEXT,
        product_evaluation TEXT,
        personal_website TEXT,
        twitter_handle TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "- Table 'contributors' created.\n";

    // 5. Analytics Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id TEXT,
        ip_hash TEXT,
        event_type TEXT DEFAULT 'view',
        path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "- Table 'analytics' created.\n";

    // 6. Announcements Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date DATE NOT NULL,
        views INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        link TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "- Table 'announcements' created.\n";

    // 7. Ads Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS ads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zone TEXT NOT NULL UNIQUE,
        image TEXT,
        link TEXT,
        active INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "- Table 'ads' created.\n";

    // --- SEED DATA ---

    // Admin User (password: sap-security-2026)
    $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
    $stmt->execute(['admin', '$2y$12$dhXL13Y74enBjfq.DZGWAe.CAkgJ5UCCc1FLvPYbt7W5tTYj9vZi6', 'admin']);
    echo "- Admin user inserted.\n";

    // Sample Blog Post
    $stmt = $pdo->prepare("INSERT INTO blogs (id, title, slug, excerpt, content, date, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        'sample-blog-1',
        'Welcome to SAP Security Expert',
        'welcome-to-sap-security-expert',
        'This is a sample blog post running on your local SQLite database.',
        '<p>Welcome! This content is being served from a local SQLite database file.</p>',
        date('Y-m-d'),
        'sap-security',
        'published'
    ]);
    echo "- Sample blog post inserted.\n";

    echo "SQLite Setup Complete! Database file: api/database.sqlite\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
