<?php
require_once 'db.php';

try {
    // Create blog_views table
    $sql = "CREATE TABLE IF NOT EXISTS blog_views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id VARCHAR(255) NOT NULL,
        visitor_token VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_post_visitor (post_id, visitor_token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);
    echo "Table 'blog_views' created or already exists successfully.";

} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}
?>
