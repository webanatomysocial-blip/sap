<?php
require_once 'api/db.php';
try {
    $pdo->exec("ALTER TABLE blogs ADD COLUMN view_count INTEGER DEFAULT 0");
    echo "Column 'view_count' added to 'blogs'.\n";
} catch (Exception $e) {
    echo "Notice: " . $e->getMessage() . "\n";
}

try {
    $pdo->exec("ALTER TABLE blogs ADD COLUMN author_id INTEGER DEFAULT 0");
    echo "Column 'author_id' added to 'blogs'.\n";
} catch (Exception $e) {
    echo "Notice: " . $e->getMessage() . "\n";
}

try {
    $pdo->exec("ALTER TABLE blogs ADD COLUMN submission_status TEXT DEFAULT 'approved'");
    echo "Column 'submission_status' added to 'blogs'.\n";
} catch (Exception $e) {
    echo "Notice: " . $e->getMessage() . "\n";
}
