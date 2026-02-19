<?php
// api/manage_blogs.php
require_once 'db.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Check if slug or id parameter is provided
        $slug = $_GET['slug'] ?? null;
        $id = $_GET['id'] ?? null;
        
        if ($slug || $id) {
            $stmt = $pdo->prepare("SELECT * FROM blogs WHERE slug = ? OR id = ? LIMIT 1");
            $stmt->execute([$slug, $id]);
            $blog = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($blog ? $blog : ['status' => 'error', 'message' => 'Blog not found']);
            exit;
        }
        
        $stmt = $pdo->query("SELECT *, (SELECT COUNT(*) FROM comments WHERE comments.post_id = blogs.slug AND comments.status = 'approved') as comment_count FROM blogs ORDER BY date DESC");
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

        // SEO Fields (Strict No Fallback)
        $meta_title = $input['meta_title'] ?? null;
        $meta_description = $input['meta_description'] ?? null;
        $meta_keywords = $input['meta_keywords'] ?? null;

        if ($id) {
            // Check existence and get current image
            $check = $pdo->prepare("SELECT id, image FROM blogs WHERE id = ?");
            $check->execute([$id]);
            $current = $check->fetch(PDO::FETCH_ASSOC);
            
            if ($current) {
                // Delete old image if it exists and is different from new image
                if (!empty($current['image']) && $current['image'] !== $image && !empty($image)) {
                    // Extract relative path from URL (e.g. /assets/blog-images/file.jpg)
                    $oldPath = __DIR__ . '/..' . $current['image'];
                    // Support both public/assets and assets
                    $oldPath = str_replace('/public/assets/', '/assets/', $oldPath);
                    // Try direct relative first
                     if (!file_exists($oldPath)) {
                        // Try with public if it was missing 
                        $oldPath = __DIR__ . '/../public' . $current['image'];
                     }

                    if (file_exists($oldPath) && is_file($oldPath)) {
                        unlink($oldPath);
                    }
                }

                // Update
                $sql = "UPDATE blogs SET title=?, slug=?, excerpt=?, content=?, author=?, date=?, image=?, category=?, tags=?, faqs=?, cta_title=?, cta_description=?, cta_button_text=?, cta_button_link=?, meta_title=?, meta_description=?, meta_keywords=? WHERE id=?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $title, $slug, $excerpt, $content, $author, $date, $image, $category, $tags,
                    json_encode($input['faqs'] ?? []),
                    $input['cta_title'] ?? null,
                    $input['cta_description'] ?? null,
                    $input['cta_button_text'] ?? null,
                    $input['cta_button_link'] ?? null,
                    $meta_title, $meta_description, $meta_keywords,
                    $id
                ]);
                echo json_encode(['status' => 'success', 'message' => 'Blog updated']);
                exit;
            }
        }

        // Insert (if no ID or ID not found, but usually ID comes from frontend generator for new posts, let's trust frontend ID or generate one)
        if (!$id) $id = uniqid('blog_');

        $sql = "INSERT INTO blogs (id, title, slug, excerpt, content, author, date, image, category, tags, faqs, cta_title, cta_description, cta_button_text, cta_button_link, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $id, $title, $slug, $excerpt, $content, $author, $date, $image, $category, $tags,
            json_encode($input['faqs'] ?? []),
            $input['cta_title'] ?? null,
            $input['cta_description'] ?? null,
            $input['cta_button_text'] ?? null,
            $input['cta_button_link'] ?? null,
            $meta_title, $meta_description, $meta_keywords
        ]);
        
        echo json_encode(['status' => 'success', 'message' => 'Blog created']);
    }
    elseif ($method === 'DELETE') {
        // Support both query param and URL path ID
        $id = $_GET['id'] ?? $_GET['slug'] ?? null;
        if (!$id) throw new Exception("ID required");
        
        // Fetch image before deleting
        $stmt = $pdo->prepare("SELECT image FROM blogs WHERE id = ? OR slug = ?");
        $stmt->execute([$id, $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && !empty($row['image'])) {
             // Logic to delete file
             $imagePath = __DIR__ . '/..' . $row['image']; // Default relative
              // Adjust if path starts with /public
             if (strpos($row['image'], '/public/') === 0) {
                 $imagePath = __DIR__ . '/..' . $row['image'];
             } else {
                 // If stored as /assets/..., it might be in public/assets or root assets depending on structure
                 // Using a safer check logic:
                 $possiblePaths = [
                    __DIR__ . '/../public' . $row['image'],
                    __DIR__ . '/..' . $row['image']
                 ];
                 foreach($possiblePaths as $p) {
                    if (file_exists($p) && is_file($p)) {
                        unlink($p);
                        break;
                    }
                 }
             }
        }

        $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = ? OR slug = ?");
        $stmt->execute([$id, $id]);
        echo json_encode(['status' => 'success', 'message' => 'Blog deleted']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
