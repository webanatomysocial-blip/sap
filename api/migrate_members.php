<?php
/**
 * api/migrate_members.php
 * Run once to:
 *   1) Create the `members` table.
 *   2) Add `is_members_only` column to `blogs` table.
 */
require_once 'db.php';

header('Content-Type: application/json');

$errors  = [];
$success = [];

// ── 1. Create members table ────────────────────────────────────────────────
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS members (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            name         TEXT NOT NULL,
            phone        TEXT,
            email        TEXT NOT NULL UNIQUE,
            location     TEXT,
            password_hash TEXT NOT NULL,
            status       TEXT NOT NULL DEFAULT 'pending',
            created_at   TEXT NOT NULL DEFAULT (datetime('now')),
            approved_at  TEXT
        )
    ");
    $success[] = 'members table created / already exists.';

    // Add company_name and job_role
    $cols = $pdo->query("PRAGMA table_info(members)")->fetchAll(PDO::FETCH_ASSOC);
    $colNames = array_column($cols, 'name');
    if (!in_array('company_name', $colNames)) {
        $pdo->exec("ALTER TABLE members ADD COLUMN company_name TEXT");
        $success[] = 'Column company_name added to members.';
    }
    if (!in_array('job_role', $colNames)) {
        $pdo->exec("ALTER TABLE members ADD COLUMN job_role TEXT");
        $success[] = 'Column job_role added to members.';
    }
} catch (Exception $e) {
    $errors[] = 'members table: ' . $e->getMessage();
}

// ── 2. Add is_members_only to blogs ───────────────────────────────────────
try {
    // SQLite does not support IF NOT EXISTS for ADD COLUMN — check first
    $cols = $pdo->query("PRAGMA table_info(blogs)")->fetchAll(PDO::FETCH_ASSOC);
    $colNames = array_column($cols, 'name');
    if (!in_array('is_members_only', $colNames)) {
        $pdo->exec("ALTER TABLE blogs ADD COLUMN is_members_only INTEGER NOT NULL DEFAULT 0");
        $success[] = 'Column is_members_only added to blogs.';
    } else {
        $success[] = 'Column is_members_only already exists in blogs.';
    }
} catch (Exception $e) {
    $errors[] = 'blogs column: ' . $e->getMessage();
}

echo json_encode([
    'status'  => empty($errors) ? 'success' : 'partial',
    'success' => $success,
    'errors'  => $errors,
]);
?>
