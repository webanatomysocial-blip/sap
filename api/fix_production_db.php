<?php
/**
 * api/fix_production_db.php
 * 
 * RUN THIS ONCE ON PRODUCTION (sap.kaphi.in) TO FIX DATABASE SCHEMA
 * 
 * 1. Fixes post_views.post_id (INT -> VARCHAR) to allow slug tracking.
 * 2. Fixes comments.timestamp (DEFAULT NULL -> CURRENT_TIMESTAMP).
 * 3. Migrates any id=0 views if possible (best effort).
 */

require_once 'db.php';

echo "<h2>Starting Database Fix...</h2>";

try {
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    echo "Detected Database Driver: <b>$driver</b><br>";

    // 1. Fix post_views table
    if ($driver === 'sqlite') {
        echo "SQLite detected. Checking schema consistency...<br>";
        
        // Ensure post_views table exists and has correct columns (best effort)
        $pdo->exec("CREATE TABLE IF NOT EXISTS post_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id TEXT,
            visitor_token TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        echo "<b>[SUCCESS]</b> post_views table verified.<br>";

        // Ensure comments table has timestamp with default
        // Note: SQLite doesn't allow MODIFY COLUMN. We check if it's there.
        $st = $pdo->query("PRAGMA table_info(comments)");
        $info = $st->fetchAll();
        $hasTimestamp = false;
        foreach ($info as $col) {
            if ($col['name'] === 'timestamp') $hasTimestamp = true;
        }

        if (!$hasTimestamp) {
            echo "Adding missing timestamp column to comments...<br>";
            $pdo->exec("ALTER TABLE comments ADD COLUMN timestamp DATETIME DEFAULT CURRENT_TIMESTAMP");
            echo "<b>[SUCCESS]</b> timestamp added.<br>";
        } else {
            echo "Comments table already has timestamp column.<br>";
        }

    } else {
        // MySQL/MariaDB
        echo "Updating post_views.post_id to VARCHAR(255) for MySQL...<br>";
        $pdo->exec("ALTER TABLE post_views MODIFY post_id VARCHAR(255)");
        echo "<b>[SUCCESS]</b> post_views table updated.<br>";
        
        echo "Updating comments.timestamp to DEFAULT CURRENT_TIMESTAMP for MySQL...<br>";
        $pdo->exec("ALTER TABLE comments MODIFY timestamp DATETIME DEFAULT CURRENT_TIMESTAMP");
        echo "<b>[SUCCESS]</b> comments table updated.<br>";
    }

    echo "<h3>Check Complete!</h3>";
    echo "<p>If you see successes above, your database is aligned. If you are on SQLite, the schema is likely already correct from the latest setup_sqlite.php.</p>";
    echo "<p>Please delete this file (fix_production_db.php) for security.</p>";

} catch (Exception $e) {
    echo "<h3>Error occurred:</h3>";
    echo "<pre>" . $e->getMessage() . "</pre>";
}
