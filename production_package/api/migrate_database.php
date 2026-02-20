<?php
/**
 * Database Migration Script
 * Run this script ONCE on the production server to ensure database schema is up-to-date
 * 
 * Access via: https://sap.mosol9.in/api/migrate_database.php
 */

header('Content-Type: application/json');

require_once 'db.php';

$migrations = [];

try {
    // Migration 1: Ensure contributor_applications table exists with all columns
    // This creates it if it doesn't exist, but won't update if it does.
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS contributor_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
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
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ");
        $migrations[] = "✓ Created/verified contributor_applications table base";
    } catch (PDOException $e) {
        $migrations[] = "✗ Error with contributor_applications: " . $e->getMessage();
    }

    // Migration 1.5: Robustly check ALL required columns
    $required_columns = [
        'full_name' => "TEXT NOT NULL DEFAULT ''",
        'email' => "TEXT NOT NULL DEFAULT ''",
        'linkedin' => "TEXT",
        'country' => "TEXT",
        'organization' => "TEXT",
        'designation' => "TEXT",
        'role' => "TEXT",
        'expertise' => "TEXT",
        'other_expertise' => "TEXT",
        'years_experience' => "TEXT",
        'short_bio' => "TEXT",
        'contribution_types' => "TEXT",
        'proposed_topics' => "TEXT",
        'contributed_elsewhere' => "TEXT",
        'previous_work_links' => "TEXT",
        'preferred_frequency' => "TEXT",
        'primary_motivation' => "TEXT",
        'weekly_time' => "TEXT",
        'volunteer_events' => "TEXT",
        'product_evaluation' => "TEXT",
        'personal_website' => "TEXT",
        'twitter_handle' => "TEXT",
        'status' => "TEXT DEFAULT 'pending'",
        'created_at' => "TEXT DEFAULT CURRENT_TIMESTAMP"
    ];

    try {
        $stmt = $pdo->query("PRAGMA table_info(contributor_applications)");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $existing_columns = array_column($columns, 'name');

        // Special handling for old 'name' column
        if (in_array('name', $existing_columns) && !in_array('full_name', $existing_columns)) {
             try {
                $pdo->exec("ALTER TABLE contributor_applications RENAME COLUMN name TO full_name");
                $migrations[] = "✓ Renamed column 'name' to 'full_name'";
                $existing_columns[] = 'full_name'; // Mark as existing now
             } catch (PDOException $e) {
                 $migrations[] = "✗ Error renaming 'name': " . $e->getMessage();
             }
        }

        foreach ($required_columns as $col => $def) {
            if (!in_array($col, $existing_columns)) {
                try {
                    $pdo->exec("ALTER TABLE contributor_applications ADD COLUMN $col $def");
                    $migrations[] = "✓ Added missing column '$col'";
                } catch (PDOException $e) {
                    $migrations[] = "✗ Error adding column '$col': " . $e->getMessage();
                }
            } else {
                // $migrations[] = "• Column '$col' already exists";
            }
        }
        $migrations[] = "✓ Verified all " . count($required_columns) . " columns in contributor_applications";

    } catch (PDOException $e) {
        $migrations[] = "✗ Error verification loop: " . $e->getMessage();
    }

    // Migration 2: Add status, edited_at, original_text, email to comments
    $comment_columns = [
        'edited_at' => "DATETIME",
        'original_text' => "TEXT",
        'status' => "TEXT DEFAULT 'pending'",
        'email' => "TEXT"
    ];

    foreach ($comment_columns as $col => $def) {
        try {
            // Need to check specific table schema or just try-add
            $pdo->exec("ALTER TABLE comments ADD COLUMN $col $def");
            $migrations[] = "✓ Added $col to comments";
        } catch (PDOException $e) {
             if (strpos($e->getMessage(), 'duplicate column') !== false) {
                 // Ignore
             } else {
                 $migrations[] = "✗ Error adding $col to comments: " . $e->getMessage();
             }
        }
    }

    // Verification: Final Count
    try {
        $stmt = $pdo->query("PRAGMA table_info(contributor_applications)");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $migrations[] = "• Final column count in contributor_applications: " . count($columns);
    } catch (PDOException $e) {}

    echo json_encode([
        'status' => 'success',
        'message' => 'Database migration completed',
        'migrations' => $migrations,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'migrations' => $migrations
    ], JSON_PRETTY_PRINT);
}
