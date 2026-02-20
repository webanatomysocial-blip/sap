<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    // Check if we need to seed initial data if empty
    $checkStmt = $pdo->query("SELECT COUNT(*) FROM trending_topics");
    if ($checkStmt->fetchColumn() == 0) {
        $seedData = [
            "#SAPGRC",
            "#LicenseCompliance",
            "#S4HANASecurity",
            "#SAP4HANACloud",
            "#IAM",
            "#GRC",
            "#Cybersecurity",
            "#BTP"
        ];
        $insert = $pdo->prepare("INSERT INTO trending_topics (topic_name, count) VALUES (:topic, 0)");
        foreach ($seedData as $topic) {
            $insert->execute([':topic' => $topic]);
        }
    }

    $stmt = $pdo->query("SELECT * FROM trending_topics ORDER BY id ASC LIMIT 10");
    $topics = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($topics);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
