<?php
/**
 * api/apply_performance_indexes.php
 * 
 * Safe performance migration: adds 7 missing database indexes.
 * Uses "IF NOT EXISTS" so this is fully idempotent and safe to run multiple times.
 * 
 * Run once: curl http://localhost:8000/api/apply_performance_indexes.php
 * or: php api/apply_performance_indexes.php
 * 
 * After running, move this file to _archive/ or delete it.
 */
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_check.php';
requireAdmin();

header('Content-Type: application/json');

$results = [];

$indexes = [
    // CRITICAL: Every blog page view does a slug lookup
    "idx_blogs_slug"              => "CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug)",
    // CRITICAL: Every list query filters by status
    "idx_blogs_status"            => "CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status)",
    // HIGH: Homepage query filters by date
    "idx_blogs_date"              => "CREATE INDEX IF NOT EXISTS idx_blogs_date ON blogs(date)",
    // CRITICAL: Every comment load queries by post_id (slug)
    "idx_comments_post_id"        => "CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)",
    // MEDIUM: Admin moderation filters by status
    "idx_comments_status"         => "CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status)",
    // MEDIUM: Community section filters contributors by status
    "idx_contributors_status"     => "CREATE INDEX IF NOT EXISTS idx_contributors_status ON contributors(status)",
    // MEDIUM: Login throttle lookups by IP
    "idx_login_attempts_ip"       => "CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip)",
    // Compound index for the most common homepage query
    "idx_blogs_status_date"       => "CREATE INDEX IF NOT EXISTS idx_blogs_status_date ON blogs(status, date)",
];

foreach ($indexes as $name => $sql) {
    try {
        $pdo->exec($sql);
        $results[$name] = 'created';
    } catch (Exception $e) {
        $results[$name] = 'error: ' . $e->getMessage();
    }
}

echo json_encode([
    'status'  => 'success',
    'message' => 'Performance indexes applied. You can now delete or archive this file.',
    'indexes' => $results
], JSON_PRETTY_PRINT);
?>
