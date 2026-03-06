<?php
require_once 'db.php';

try {
    // Add rejection_reason to contributors
    $pdo->exec("ALTER TABLE contributors ADD COLUMN rejection_reason TEXT DEFAULT NULL");
    echo "Added rejection_reason to contributors table.\n";
} catch (PDOException $e) {
    echo "Note: contributors.rejection_reason may already exist or error: " . $e->getMessage() . "\n";
}

try {
    // Add rejection_reason to comments
    $pdo->exec("ALTER TABLE comments ADD COLUMN rejection_reason TEXT DEFAULT NULL");
    echo "Added rejection_reason to comments table.\n";
} catch (PDOException $e) {
    echo "Note: comments.rejection_reason may already exist or error: " . $e->getMessage() . "\n";
}

echo "Migration completed.\n";
?>
