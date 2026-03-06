<?php
/**
 * GET /api/admin/blogs/pending
 * Returns all submitted (pending review) blogs for admin.
 */
require_once 'db.php';
require_once 'auth_check.php';
require_once 'permission_check.php';

header('Content-Type: application/json');

checkPermission('can_review_blogs');

$isContributor = isset($_SESSION['role']) && $_SESSION['role'] === 'contributor';
$currentUserId = $_SESSION['admin_id'] ?? null;

try {
    $status = $_GET['status'] ?? 'pending';
    
    $whereClause = "WHERE b.submission_status IN ('submitted', 'edited')";
    if ($status === 'rejected') {
        $whereClause = "WHERE b.submission_status = 'rejected'";
    }

    $sql = "SELECT b.*, 
                   u.id as author_id, u.username as author_username, u.role as author_role,
                   COALESCE(c.full_name, u.full_name, u.username) as author_name,
                   COALESCE(c.image, u.profile_image) as author_image,
                   c.short_bio as author_bio, c.designation as author_designation
            FROM blogs b
            LEFT JOIN users u ON u.id = b.author_id
            LEFT JOIN contributors c ON c.id = u.contributor_id
            $whereClause";

    $params = [];
    if ($isContributor && $currentUserId) {
        $sql .= " AND b.author_id != ?";
        $params[] = $currentUserId;
    }

    $sql .= " ORDER BY b.date DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
