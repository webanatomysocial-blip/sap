<?php
require __DIR__ . '/db.php';

try {
    // Check if columns exist (SQLite doesn't support 'ADD COLUMN IF NOT EXISTS' nicely)
    $stmt = $pdo->query("PRAGMA table_info(blogs)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $columnNames = array_column($columns, 'name');

    if (!in_array('plagiarism_score', $columnNames)) {
        $pdo->exec("ALTER TABLE blogs ADD COLUMN plagiarism_score INTEGER DEFAULT NULL");
        echo "Added plagiarism_score column.\n";
    }
    if (!in_array('plagiarism_status', $columnNames)) {
        $pdo->exec("ALTER TABLE blogs ADD COLUMN plagiarism_status TEXT DEFAULT 'pending'");
        echo "Added plagiarism_status column.\n";
    }
    if (!in_array('plagiarism_checked_at', $columnNames)) {
        $pdo->exec("ALTER TABLE blogs ADD COLUMN plagiarism_checked_at DATETIME NULL");
        echo "Added plagiarism_checked_at column.\n";
    }

    $pdo->exec("CREATE TABLE IF NOT EXISTS plagiarism_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blog_id INTEGER,
        score INTEGER,
        raw_response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "Created plagiarism_logs table.\n";

    echo "Migration completed successfully.\n";
} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage() . "\n";
}
