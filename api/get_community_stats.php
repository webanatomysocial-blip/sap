<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    // Count approved contributors
    $stmt1 = $pdo->query("SELECT COUNT(*) as active_contributors FROM contributors WHERE status = 'approved'");
    $row1 = $stmt1->fetch(PDO::FETCH_ASSOC);
    $active_contributors = $row1 ? (int)$row1['active_contributors'] : 0;
    
    // Count approved members
    $stmt2 = $pdo->query("SELECT COUNT(*) as total_members FROM members WHERE status = 'approved'");
    $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
    // Fallback: If no approved members yet, we might want a base number or just 0
    $total_members = $row2 ? (int)$row2['total_members'] : 0;

    echo json_encode([
        "active_contributors" => $active_contributors,
        "total_members" => $total_members
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "active_contributors" => 0,
        "total_members" => 0
    ]); // Fallback safely
}
?>
