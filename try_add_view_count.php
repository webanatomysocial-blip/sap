<?php
require_once 'api/db.php';
try {
    $pdo->exec("ALTER TABLE blogs ADD COLUMN view_count INTEGER DEFAULT 0");
    echo "Column 'view_count' ADD SUCCESS\n";
} catch (Exception $e) {
    echo "Column 'view_count' FAILED: " . $e->getMessage() . "\n";
}
