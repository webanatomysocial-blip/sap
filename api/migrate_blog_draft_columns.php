<?php
/**
 * api/migrate_blog_draft_columns.php
 * Adds draft columns to the blogs table to support editing approved blogs.
 */
require_once 'db.php';

try {
    $columns = [
        'draft_title' => "VARCHAR(255) NULL",
        'draft_excerpt' => "TEXT NULL",
        'draft_content' => "LONGTEXT NULL",
        'draft_meta_title' => "VARCHAR(255) NULL",
        'draft_meta_description' => "TEXT NULL",
        'draft_meta_keywords' => "TEXT NULL",
        'draft_image' => "VARCHAR(255) NULL",
        'draft_category' => "VARCHAR(100) NULL",
        'draft_faqs' => "JSON NULL",
        'draft_cta_title' => "VARCHAR(255) NULL",
        'draft_cta_description' => "TEXT NULL",
        'draft_cta_button_text' => "VARCHAR(150) NULL",
        'draft_cta_button_link' => "VARCHAR(255) NULL"
    ];

    foreach ($columns as $col => $def) {
        try {
            $pdo->exec("ALTER TABLE blogs ADD COLUMN $col $def");
            echo "✓ Added column $col\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'duplicate column') !== false || strpos($e->getMessage(), '1060') !== false) {
                echo "• Column $col already exists\n";
            } else {
                echo "✗ Error adding $col: " . $e->getMessage() . "\n";
            }
        }
    }

    echo "Migration finished.\n";
} catch (Exception $e) {
    echo "Fatal error: " . $e->getMessage() . "\n";
}
?>
