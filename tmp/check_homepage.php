<?php
// Test script to check homepage data API response
require_once 'api/db.php';

$currentDateTime = gmdate('Y-m-d H:i:s');

// Fetch featured blog
$featuredSql = "SELECT id, title, excerpt, slug, category, is_members_only, status, date FROM blogs 
    WHERE status IN ('approved', 'published') AND date <= ?
    ORDER BY date DESC, id DESC LIMIT 1";

$stmt = $pdo->prepare($featuredSql);
$stmt->execute([$currentDateTime]);
$featured = $stmt->fetch(PDO::FETCH_ASSOC);

echo "=== Featured Blog ===\n";
echo json_encode($featured, JSON_PRETTY_PRINT) . "\n\n";

// Check total published blogs
$countSql = "SELECT COUNT(*) as total FROM blogs WHERE status IN ('approved', 'published') AND date <= ?";
$stmt = $pdo->prepare($countSql);
$stmt->execute([$currentDateTime]);
echo "=== Total Published Blogs ===\n";
echo json_encode($stmt->fetch(), JSON_PRETTY_PRINT) . "\n\n";

// Check is_members_only values
$stmt = $pdo->query("SELECT id, title, is_members_only FROM blogs WHERE is_members_only IS NOT NULL AND is_members_only != 0 LIMIT 5");
echo "=== Members Only Blogs ===\n";
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT) . "\n";
