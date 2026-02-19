<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Fetch approved contributors
        $stmt = $pdo->prepare("
            SELECT full_name, email, linkedin, short_bio, role, expertise, created_at, image AS profile_image, status
            FROM contributors
            WHERE status = 'approved'
            ORDER BY created_at DESC
        ");
        
        $stmt->execute();
        $contributors = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Parse JSON fields
        foreach ($contributors as &$contributor) {
            if (isset($contributor['expertise'])) {
                $contributor['expertise'] = json_decode($contributor['expertise'], true);
            }
        }
        
        echo json_encode([
            'status' => 'success',
            'contributors' => $contributors,
            'count' => count($contributors)
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}
