<?php
// api/manage_announcements.php
require_once 'db.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

session_start();
$isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
$currentDate = date('Y-m-d');

try {
    if ($method === 'GET') {
        $sql = "SELECT * FROM announcements";
        $params = [];
        
        if (!$isAdmin) {
            $sql .= " WHERE status = 'active' AND (date <= ? OR date IS NULL)";
            $params[] = $currentDate;
        }
        
        $sql .= " ORDER BY date DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($announcements);
    } 
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $id = $input['id'] ?? null;
        $title = $input['title'];
        $date = $input['date'];
        $link = $input['link'] ?? '';
        $status = $input['status'] ?? 'active';

        if ($id) {
            // Check existence
            $check = $pdo->prepare("SELECT id FROM announcements WHERE id = ?");
            $check->execute([$id]);
            if ($check->fetch()) {
                // Update
                $stmt = $pdo->prepare("UPDATE announcements SET title=?, date=?, link=?, status=? WHERE id=?");
                $stmt->execute([$title, $date, $link, $status, $id]);
                echo json_encode(['status' => 'success', 'message' => 'Announcement updated']);
                exit;
            }
        }

        // Insert
        $stmt = $pdo->prepare("INSERT INTO announcements (title, date, link, status, views, comments) VALUES (?, ?, ?, ?, 0, 0)");
        $stmt->execute([$title, $date, $link, $status]);
        
        echo json_encode(['status' => 'success', 'message' => 'Announcement created']);
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ID required");
        
        $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'Announcement deleted']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
