<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    // Check if we need to seed initial data if empty
    $checkStmt = $pdo->query("SELECT COUNT(*) FROM announcements");
    if ($checkStmt->fetchColumn() == 0) {
        $seedData = [
            ['title' => 'New SAP Security Patch Day - March 2025', 'date' => 'Mar 01 2025', 'views' => 120, 'comments' => 45],
            ['title' => 'Webinar: Moving GRC to the Cloud', 'date' => 'Mar 05 2025', 'views' => 85, 'comments' => 12],
            ['title' => 'Community Meetup in Berlin', 'date' => 'Mar 10 2025', 'views' => 200, 'comments' => 30]
        ];
        $insert = $pdo->prepare("INSERT INTO announcements (title, date, views, comments) VALUES (:title, :date, :views, :comments)");
        foreach ($seedData as $item) {
            $insert->execute($item);
        }
    }

    $stmt = $pdo->query("SELECT * FROM announcements ORDER BY id DESC LIMIT 5");
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($announcements);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
