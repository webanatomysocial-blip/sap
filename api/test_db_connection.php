<?php
// api/test_db_connection.php
require_once 'db.php';

try {
    $stmt = $pdo->query("SELECT 1");
    if ($stmt) {
        echo "Database connection successful!";
        if (isset($config['DB_CONNECTION']) && $config['DB_CONNECTION'] === 'sqlite') {
            echo " Using SQLite.";
        }
    } else {
        echo "Database connection failed (query returned false).";
    }
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage();
}
?>
