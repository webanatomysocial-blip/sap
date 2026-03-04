<?php
/**
 * api/migrate_contributor_login.php
 * Idempotent migration for the Contributor Login Management System.
 * Safe to run multiple times — checks column existence before altering.
 *
 * Usage: php api/migrate_contributor_login.php
 *   OR:  curl http://localhost:8000/api/migrate-contributor-login
 *
 * Rollback: Drop user_permissions table; remove added columns manually.
 */

require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$log = [];
$errors = [];

try {
    // ── Detect DB type ──────────────────────────────────────────────────────
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME); // 'sqlite' or 'mysql'
    $log[] = "Driver: $driver";

    // ── Helper: check column exists ──────────────────────────────────────────
    function columnExists(PDO $pdo, string $table, string $column, string $driver): bool {
        if ($driver === 'sqlite') {
            $stmt = $pdo->query("PRAGMA table_info($table)");
            foreach ($stmt->fetchAll() as $col) {
                if ($col['name'] === $column) return true;
            }
            return false;
        } else {
            // MySQL / MariaDB
            $stmt = $pdo->prepare(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?"
            );
            $stmt->execute([$table, $column]);
            return (int)$stmt->fetchColumn() > 0;
        }
    }

    // ── Helper: table exists check ───────────────────────────────────────────
    function tableExists(PDO $pdo, string $table, string $driver): bool {
        if ($driver === 'sqlite') {
            $stmt = $pdo->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
            $stmt->execute([$table]);
            return (bool)$stmt->fetch();
        } else {
            $stmt = $pdo->prepare(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?"
            );
            $stmt->execute([$table]);
            return (int)$stmt->fetchColumn() > 0;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. users table — add contributor_id
    // ═══════════════════════════════════════════════════════════════════════════
    if (!columnExists($pdo, 'users', 'contributor_id', $driver)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN contributor_id INTEGER NULL");
        $log[] = "users.contributor_id: ADDED";
    } else {
        $log[] = "users.contributor_id: already exists, skipped";
    }

    // users — add is_active
    if (!columnExists($pdo, 'users', 'is_active', $driver)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1");
        $log[] = "users.is_active: ADDED";
    } else {
        $log[] = "users.is_active: already exists, skipped";
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. user_permissions table
    // ═══════════════════════════════════════════════════════════════════════════
    if (!tableExists($pdo, 'user_permissions', $driver)) {
        if ($driver === 'sqlite') {
            $pdo->exec("
                CREATE TABLE user_permissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    can_manage_blogs INTEGER NOT NULL DEFAULT 0,
                    can_manage_ads INTEGER NOT NULL DEFAULT 0,
                    can_manage_comments INTEGER NOT NULL DEFAULT 0,
                    can_manage_announcements INTEGER NOT NULL DEFAULT 0,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");
        } else {
            $pdo->exec("
                CREATE TABLE user_permissions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    can_manage_blogs TINYINT(1) NOT NULL DEFAULT 0,
                    can_manage_ads TINYINT(1) NOT NULL DEFAULT 0,
                    can_manage_comments TINYINT(1) NOT NULL DEFAULT 0,
                    can_manage_announcements TINYINT(1) NOT NULL DEFAULT 0,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ");
        }
        $log[] = "user_permissions: CREATED";
    } else {
        $log[] = "user_permissions: already exists, skipped";
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. blogs table — add submission_status and author_id
    // ═══════════════════════════════════════════════════════════════════════════
    if (!columnExists($pdo, 'blogs', 'submission_status', $driver)) {
        $pdo->exec("ALTER TABLE blogs ADD COLUMN submission_status TEXT NOT NULL DEFAULT 'approved'");
        $log[] = "blogs.submission_status: ADDED";
    } else {
        $log[] = "blogs.submission_status: already exists, skipped";
    }

    if (!columnExists($pdo, 'blogs', 'author_id', $driver)) {
        $pdo->exec("ALTER TABLE blogs ADD COLUMN author_id INTEGER NULL");
        $log[] = "blogs.author_id: ADDED";
    } else {
        $log[] = "blogs.author_id: already exists, skipped";
    }

    echo json_encode([
        'status'  => 'success',
        'message' => 'Migration completed successfully',
        'log'     => $log,
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage(),
        'log'     => $log,
    ], JSON_PRETTY_PRINT);
}
?>
