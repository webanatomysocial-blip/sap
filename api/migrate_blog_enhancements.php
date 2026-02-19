<?php
require_once 'db.php';

try {
    // Add FAQS column
    $pdo->exec("ALTER TABLE blogs ADD COLUMN faqs JSON NULL");
    echo "Added faqs column.\n";
} catch (Exception $e) {
    // Ignore if exists (or check specific error, but simplistic approach for this patch)
    echo "faqs column might already exist or error: " . $e->getMessage() . "\n";
}

try {
    $pdo->exec("ALTER TABLE blogs ADD COLUMN cta_title VARCHAR(255) NULL");
    echo "Added cta_title column.\n";
} catch (Exception $e) { echo "cta_title error: " . $e->getMessage() . "\n"; }

try {
    $pdo->exec("ALTER TABLE blogs ADD COLUMN cta_description TEXT NULL");
    echo "Added cta_description column.\n";
} catch (Exception $e) { echo "cta_description error: " . $e->getMessage() . "\n"; }

try {
    $pdo->exec("ALTER TABLE blogs ADD COLUMN cta_button_text VARCHAR(150) NULL");
    echo "Added cta_button_text column.\n";
} catch (Exception $e) { echo "cta_button_text error: " . $e->getMessage() . "\n"; }

try {
    $pdo->exec("ALTER TABLE blogs ADD COLUMN cta_button_link VARCHAR(255) NULL");
    echo "Added cta_button_link column.\n";
} catch (Exception $e) { echo "cta_button_link error: " . $e->getMessage() . "\n"; }

echo "Migration attempt finished.";
?>
