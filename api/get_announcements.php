<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT id, title, date, comments, link, status FROM announcements WHERE status = 'active' ORDER BY date DESC LIMIT 10");
    $stmt->execute();
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates to "Mar 10 2025" style
    foreach ($announcements as &$announcement) {
        if (isset($announcement['date'])) {
            $timestamp = strtotime($announcement['date']);
            $announcement['date'] = date('M j Y', $timestamp); // e.g., "Mar 10 2025"
        }
        // Remove views field from response
        unset($announcement['views']);
    }
    
    echo json_encode($announcements);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
