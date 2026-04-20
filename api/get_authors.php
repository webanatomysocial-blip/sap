<?php
// api/get_authors.php - Fetch all eligible blog authors (admin + approved contributors)
require_once 'db.php';
require_once 'auth_check.php';

// Only admins can assign authors
if ($_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

try {
    // Return: admin user(s) + contributor users who have an approved contributor record
    $sql = "SELECT u.id, u.username, u.role, u.contributor_id,
                   COALESCE(c.full_name, u.full_name, u.username) as display_name,
                   COALESCE(c.image, u.profile_image) as author_image
            FROM users u
            LEFT JOIN contributors c ON u.contributor_id = c.id
            WHERE u.is_active = 1
              AND (
                u.role = 'admin'
                OR (u.role = 'contributor' AND c.status = 'approved')
              )
            ORDER BY u.role DESC, display_name ASC";

    $stmt = $pdo->query($sql);
    $authors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $authors
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
