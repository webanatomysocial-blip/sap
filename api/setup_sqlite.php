<?php
// api/setup_sqlite.php
// Script to initialize local SQLite database matching the production schema (Non-destructive)

$dbFile = __DIR__ . '/database.sqlite';

try {
    $pdo = new PDO("sqlite:$dbFile");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Checking SQLite database...\n";

    // Helper function to check if column exists
    function columnExists($pdo, $table, $column) {
        $stmt = $pdo->query("PRAGMA table_info($table)");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            if ($col['name'] === $column) return true;
        }
        return false;
    }

    // 1. Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'editor',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "- Table 'users' check/create done.\n";

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
    echo "- Table 'blogs' check/create done.\n";

    // Blogs Migrations
    $blogColumns = [
        'faqs' => 'TEXT',
        'meta_keywords' => 'TEXT',
        'cta_title' => 'TEXT',
        'cta_description' => 'TEXT',
        'cta_button_text' => 'TEXT',
        'cta_button_link' => 'TEXT',
        'author_id' => 'INTEGER'
    ];

    foreach ($blogColumns as $col => $type) {
        if (!columnExists($pdo, 'blogs', $col)) {
            $pdo->exec("ALTER TABLE blogs ADD COLUMN $col $type");
            echo "  + Added column '$col' to 'blogs'.\n";
        }
    }

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
    echo "- Table 'comments' check/create done.\n";

    // Comments Migrations (if any needed in future)
    if (!columnExists($pdo, 'comments', 'edited_at')) {
         $pdo->exec("ALTER TABLE comments ADD COLUMN edited_at DATETIME NULL");
         echo "  + Added column 'edited_at' to 'comments'.\n";
    }
    if (!columnExists($pdo, 'comments', 'original_text')) {
         $pdo->exec("ALTER TABLE comments ADD COLUMN original_text TEXT NULL");
         echo "  + Added column 'original_text' to 'comments'.\n";
    }
    // Checking parent_id as well since it appeared in previous schema checks output
    if (!columnExists($pdo, 'comments', 'parent_id')) {
         $pdo->exec("ALTER TABLE comments ADD COLUMN parent_id INTEGER DEFAULT NULL REFERENCES comments(id) ON DELETE CASCADE");
         echo "  + Added column 'parent_id' to 'comments'.\n";
    }

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
    echo "- Table 'contributors' check/create done.\n";

    // Contributors Migrations
    if (!columnExists($pdo, 'contributors', 'image')) {
        $pdo->exec("ALTER TABLE contributors ADD COLUMN image TEXT");
        echo "  + Added column 'image' to 'contributors'.\n";
    }

    // 5. Analytics Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id TEXT,
        ip_hash TEXT,
        event_type TEXT DEFAULT 'view',
        path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "- Table 'analytics' check/create done.\n";

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
    echo "- Table 'announcements' check/create done.\n";

    // 7. Ads Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS ads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zone TEXT NOT NULL UNIQUE,
        image TEXT,
        link TEXT,
        active INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "- Table 'ads' check/create done.\n";
    
     if (!columnExists($pdo, 'ads', 'status')) {
        $pdo->exec("ALTER TABLE ads ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
        echo "  + Added column 'status' to 'ads'.\n";
    }

    // 8. Post Views Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS post_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        ip_address TEXT,
        visitor_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES blogs(id) ON DELETE CASCADE
    )");
    echo "- Table 'post_views' check/create done.\n";


    // --- SEED DATA (Only if empty) ---

    // Admin User
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $stmt->execute(['admin']);
    if ($stmt->fetchColumn() == 0) {
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
        $stmt->execute(['admin', '$2y$12$dhXL13Y74enBjfq.DZGWAe.CAkgJ5UCCc1FLvPYbt7W5tTYj9vZi6', 'admin']);
        echo "- Admin user inserted.\n";
    }

    // Sample Blog Post
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM blogs WHERE id = ?");
    $stmt->execute(['sample-blog-1']);
    if ($stmt->fetchColumn() == 0) {
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
    }

    echo "SQLite Setup/Update Complete! Database file: api/database.sqlite\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
