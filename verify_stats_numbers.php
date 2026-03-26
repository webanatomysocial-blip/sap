<?php
require_once 'api/db.php';

$stats = [];

$stmt = $pdo->query("SELECT COUNT(*) AS c FROM contributors WHERE status = 'approved'");
$stats['contributors'] = (int)$stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) AS c FROM blogs WHERE submission_status IN ('submitted', 'edited')");
$stats['pending_reviews'] = (int)$stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) AS c FROM comments WHERE status = 'pending'");
$stats['pending_comments'] = (int)$stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) AS c FROM blogs");
$stats['blogs'] = (int)$stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) AS c FROM members WHERE status = 'approved'");
$stats['approved_members'] = (int)$stmt->fetchColumn();

$stmt = $pdo->query("SELECT SUM(view_count) FROM blogs");
$stats['total_views'] = (int)$stmt->fetchColumn();

echo "STATS: " . json_encode($stats) . "\n";
