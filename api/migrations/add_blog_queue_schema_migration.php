<?php
// api/migrations/add_blog_queue_schema_migration.php
require_once __DIR__ . '/../db.php';

try {
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    echo "Running migration for $driver database...\n";

    if ($driver === 'sqlite') {
        // 1. Ensure email_queue table exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS email_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipient TEXT NOT NULL,
            blog_id INTEGER,
            subject TEXT NOT NULL,
            body TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            attempts INTEGER NOT NULL DEFAULT 0,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            sent_at DATETIME DEFAULT NULL
        )");
        echo "- Table 'email_queue' verified.\n";

        // Check/Add blog_id to email_queue if table existed but without blog_id
        $stmt = $pdo->query("PRAGMA table_info(email_queue)");
        $cols = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'name');
        if (!in_array('blog_id', $cols)) {
            $pdo->exec("ALTER TABLE email_queue ADD COLUMN blog_id INTEGER DEFAULT NULL");
            echo "- Column 'blog_id' added to 'email_queue'.\n";
        }

        // Add unique index on (recipient, blog_id)
        $pdo->exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_recipient_blog ON email_queue(recipient, blog_id)");
        echo "- Unique index 'idx_recipient_blog' verified.\n";

        // 2. Ensure is_queued_for_members column in blogs table
        $stmt = $pdo->query("PRAGMA table_info(blogs)");
        $cols = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'name');
        if (!in_array('is_queued_for_members', $cols)) {
            $pdo->exec("ALTER TABLE blogs ADD COLUMN is_queued_for_members INTEGER DEFAULT 0");
            echo "- Column 'is_queued_for_members' added to 'blogs'.\n";
        }

    } else {
        // MySQL/MariaDB
        // 1. Ensure email_queue table exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS email_queue (
            id INT AUTO_INCREMENT PRIMARY KEY,
            recipient VARCHAR(255) NOT NULL,
            blog_id INT,
            subject VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            attempts INT NOT NULL DEFAULT 0,
            error_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            sent_at TIMESTAMP NULL DEFAULT NULL
        )");
        echo "- Table 'email_queue' verified.\n";

        // Check/Add blog_id to email_queue if table existed but without blog_id
        $stmt = $pdo->prepare("SHOW COLUMNS FROM email_queue LIKE 'blog_id'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            $pdo->exec("ALTER TABLE email_queue ADD COLUMN blog_id INT DEFAULT NULL");
            echo "- Column 'blog_id' added to 'email_queue'.\n";
        }

        // Add unique index on (recipient, blog_id)
        $stmt = $pdo->prepare("SHOW INDEX FROM email_queue WHERE Key_name = 'uq_recipient_blog'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            $pdo->exec("ALTER TABLE email_queue ADD UNIQUE KEY uq_recipient_blog (recipient, blog_id)");
            echo "- Unique key 'uq_recipient_blog' added to 'email_queue'.\n";
        }

        // 2. Ensure is_queued_for_members column in blogs table
        $stmt = $pdo->prepare("SHOW COLUMNS FROM blogs LIKE 'is_queued_for_members'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            $pdo->exec("ALTER TABLE blogs ADD COLUMN is_queued_for_members TINYINT DEFAULT 0");
            echo "- Column 'is_queued_for_members' added to 'blogs'.\n";
        }
    }

    echo "Migration completed successfully.\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
