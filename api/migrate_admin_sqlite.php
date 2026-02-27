<?php
// migrate_admin_sqlite.php - Run once to update SQLite table
require_once 'db.php';

try {
    echo "Starting SQLite Migration...\n";
    
    // Check if columns exist
    $columns = $pdo->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC);
    $columnNames = array_column($columns, 'name');
    
    $queries = [];
    if (!in_array('full_name', $columnNames)) {
        $queries[] = "ALTER TABLE users ADD COLUMN full_name VARCHAR(255)";
    }
    if (!in_array('email', $columnNames)) {
        $queries[] = "ALTER TABLE users ADD COLUMN email VARCHAR(255)";
    }
    if (!in_array('profile_image', $columnNames)) {
        $queries[] = "ALTER TABLE users ADD COLUMN profile_image VARCHAR(255)";
    }
    if (!in_array('updated_at', $columnNames)) {
        $queries[] = "ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP";
    }

    foreach ($queries as $sql) {
        $pdo->exec($sql);
        echo "Executed: $sql\n";
    }
    
    echo "Migration Complete!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
