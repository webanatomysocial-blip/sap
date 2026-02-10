<?php
// api/manage_comments.php
require_once 'db.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Admin view - Get all comments or filtered
        $stmt = $pdo->query("SELECT id, post_id, user_name as author, content as text, timestamp as date, status, edited_at, original_text FROM comments ORDER BY timestamp DESC");
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($comments);
    } 
    elseif ($method === 'POST') {
        // Handle Status Update (Approve/Reject) OR Edit
        // Expected: { id: 1, status: 'approved' } OR { id: 1, action: 'edit', content: '...' }
        $input = json_decode(file_get_contents('php://input'), true);
        
        $id = $input['id'] ?? null;
        $action = $input['action'] ?? 'status';
        
        if (!$id) throw new Exception("ID required");

        if ($action === 'edit') {
            // Edit comment content
            $newContent = $input['content'] ?? null;
            if (!$newContent) throw new Exception("Content required for edit");
            
            // First, fetch the current content to save as original
            $stmt = $pdo->prepare("SELECT content, original_text FROM comments WHERE id = ?");
            $stmt->execute([$id]);
            $comment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$comment) throw new Exception("Comment not found");
            
            // Save current content as original if not already saved
            $originalText = $comment['original_text'] ?: $comment['content'];
            
            // Update with new content and timestamp
            $stmt = $pdo->prepare("UPDATE comments SET content = ?, original_text = ?, edited_at = NOW() WHERE id = ?");
            $stmt->execute([$newContent, $originalText, $id]);
            
            echo json_encode(['status' => 'success', 'message' => 'Comment updated']);
        } else {
            // Status update (approve/reject)
            $status = $input['status'] ?? null;
            if (!$status) throw new Exception("Status required");

            $stmt = $pdo->prepare("UPDATE comments SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            
            echo json_encode(['status' => 'success', 'message' => 'Comment status updated']);
        }
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ID required");
        
        $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'Comment deleted']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
