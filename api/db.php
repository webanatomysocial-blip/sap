<?php
// api/db.php
// Setup headers for CORS if needed during local dev (if React and PHP are on different ports)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$db_file = __DIR__ . '/database.sqlite';

try {
    $pdo = new PDO("sqlite:" . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Performance optimizations for SQLite
    $pdo->exec("PRAGMA journal_mode = WAL");
    $pdo->exec("PRAGMA synchronous = NORMAL");

    // Create tables and indexes if they don't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, ip_address)
    )");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_likes_ip ON likes(ip_address)");

    $pdo->exec("CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)");

    // Views table
    $pdo->exec("CREATE TABLE IF NOT EXISTS views (
        post_id TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
    )");

    // View Logs table for unique views
    $pdo->exec("CREATE TABLE IF NOT EXISTS view_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, ip_address)
    )");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_view_logs_post ON view_logs(post_id)");

    // Announcements table
    $pdo->exec("CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        link TEXT
    )");

    // Trending Topics table
    $pdo->exec("CREATE TABLE IF NOT EXISTS trending_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_name TEXT NOT NULL,
        count INTEGER DEFAULT 0
    )");

} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
