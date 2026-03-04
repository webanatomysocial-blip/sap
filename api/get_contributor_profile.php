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
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Contributor ID is required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT id, full_name, role, organization, designation, short_bio, expertise, image AS profile_image, linkedin, twitter_handle, personal_website, created_at
            FROM contributors
            WHERE id = ? AND status = 'approved'
        ");
        
        $stmt->execute([$id]);
        $contributor = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$contributor) {
            echo json_encode(['status' => 'error', 'message' => 'Contributor not found or not approved.']);
            exit;
        }

        // Parse JSON fields
        if (isset($contributor['expertise'])) {
            $contributor['expertise'] = json_decode($contributor['expertise'], true);
        }
        
        echo json_encode([
            'status' => 'success',
            'contributor' => $contributor
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
