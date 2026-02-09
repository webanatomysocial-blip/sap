<?php
// api/manage_blogs.php
require_once 'db.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM blogs ORDER BY date DESC");
        $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($blogs);
    } 
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Check for ID to determine Update vs Insert
        // Actually, for consistency with admin tool, let's look for 'id'
        // If ID exists and is found in DB -> Update. Else -> Insert.
        
        $id = $input['id'] ?? null;
        $title = $input['title'];
        $slug = $input['slug'];
        $excerpt = $input['excerpt'] ?? '';
        $content = $input['content'] ?? '';
        $author = $input['author'] ?? 'Admin';
        $date = $input['date'] ?? date('Y-m-d');
        $image = $input['image'] ?? '';
        $category = $input['category'] ?? 'sap-security';
        $tags = $input['tags'] ?? '';

        if ($id) {
            // Check existence
            $check = $pdo->prepare("SELECT id FROM blogs WHERE id = ?");
            $check->execute([$id]);
            if ($check->fetch()) {
                // Update
                $sql = "UPDATE blogs SET title=?, slug=?, excerpt=?, content=?, author=?, date=?, image=?, category=?, tags=? WHERE id=?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$title, $slug, $excerpt, $content, $author, $date, $image, $category, $tags, $id]);
                echo json_encode(['status' => 'success', 'message' => 'Blog updated']);
                exit;
            }
        }

        // Insert (if no ID or ID not found, but usually ID comes from frontend generator for new posts, let's trust frontend ID or generate one)
        if (!$id) $id = uniqid('blog_');

        $sql = "INSERT INTO blogs (id, title, slug, excerpt, content, author, date, image, category, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id, $title, $slug, $excerpt, $content, $author, $date, $image, $category, $tags]);
        
        echo json_encode(['status' => 'success', 'message' => 'Blog created']);
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ID required");
        
        $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'Blog deleted']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
