<?php
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;

    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
        exit;
    }

    try {
        // 1. Get image path
        $stmt = $pdo->prepare("SELECT image FROM contributors WHERE id = ?");
        $stmt->execute([$id]);
        $contributor = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($contributor) {
            // 2. Delete image if exists
            if (!empty($contributor['image'])) {
                $imagePath = __DIR__ . '/..' . $contributor['image'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }

            // 3. Delete record
            $deleteStmt = $pdo->prepare("DELETE FROM contributors WHERE id = ?");
            $deleteStmt->execute([$id]);

            echo json_encode(['status' => 'success', 'message' => 'Contributor deleted successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Contributor not found']);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>
