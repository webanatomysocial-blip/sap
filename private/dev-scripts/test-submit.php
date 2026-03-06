<?php
require 'api/db.php';
$id = uniqid('blog_');
$title = "Test Blog";
$slug = "test-blog";
$excerpt = "Test";
$content = "Test content";
$date = date('Y-m-d');
$image = "";
$category = "sap-security";
$tags = "";
$faqs = json_encode([]);
$meta_title = "";
$meta_description = "";
$meta_keywords = "";
// simulate contributor insert
try {
    $sql = "INSERT INTO blogs
            (id, title, slug, excerpt, content, author_id,
             date, image, category, tags, faqs,
             meta_title, meta_description, meta_keywords,
             status, submission_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'submitted')";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id, $title, $slug, $excerpt, $content, 2,
        $date, $image, $category, $tags,
        $faqs, $meta_title, $meta_description, $meta_keywords,
    ]);
    echo "Success\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
