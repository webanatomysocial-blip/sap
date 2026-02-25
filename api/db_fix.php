<?php
// api/db_fix.php
require_once 'db.php';

header("Content-Type: text/plain");

try {
    // Force ALL blogs to be published so they appear on the frontend unconditionally
    $stmt = $pdo->query("UPDATE blogs SET status = 'published' WHERE status IS NULL OR status != 'published'");
    echo "SUCCESS: Updated " . $stmt->rowCount() . " hidden blogs to 'published'.\n";
    
    // Optional: Also clean up any diagnostic tests we generated earlier
    $pdo->exec("DELETE FROM blogs WHERE slug = 'system-diagnostic-post' OR slug = 'test-blog-past'");
    echo "SUCCESS: Cleaned up diagnostic tests.\n";
    
} catch(Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
