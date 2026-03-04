<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Debugging script testing SQLite safe datetimes compared directly within the framework
try {
    $pdo = new PDO('sqlite:database.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "--- Active Target Queries ---\n";
    
    // Simulate Public fetch query correctly modified using local datetime
    $sql = "SELECT b.slug, b.title, b.status, b.publish_datetime, datetime('now', 'localtime') as sqlite_db_time
            FROM blogs b
            WHERE b.status = 'approved' AND b.publish_datetime IS NOT NULL AND datetime(b.publish_datetime) <= datetime('now', 'localtime')";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Accessible Public Blogs (Should ONLY be Live or Past-Scheduled):\n";
    foreach($result as $row) {
        echo "- " . $row['slug'] . " | " . $row['publish_datetime'] . "\n";
    }

} catch(PDOException $e) {
    echo "SQL ERROR: " . $e->getMessage() . "\n";
}
