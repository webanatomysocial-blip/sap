<?php
/**
 * api/migrate_blog_updated_at.php
 * Adds missing updated_at column to the blogs table.
 */
require_once 'db.php';

try {
    try {
        $pdo->exec("ALTER TABLE blogs ADD COLUMN updated_at DATETIME");
        echo "✓ Added column updated_at\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'duplicate column') !== false || strpos($e->getMessage(), '1060') !== false) {
            echo "• Column updated_at already exists\n";
        } else {
            echo "✗ Error adding updated_at: " . $e->getMessage() . "\n";
        }
    }

    echo "Migration finished.\n";
} catch (Exception $e) {
    echo "Fatal error: " . $e->getMessage() . "\n";
}
?>
