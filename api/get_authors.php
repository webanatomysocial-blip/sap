<?php
// api/get_authors.php - Fetch all users who can be authors
require_once 'db.php';
require_once 'auth_check.php';

// Only admins and reviewers can fetch full list
if (!in_array($_SESSION['role'], ['admin', 'reviewer'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

try {
    $sql = "SELECT u.id, u.username, u.full_name, u.role, u.contributor_id,
                   COALESCE(c.full_name, u.full_name, u.username) as display_name
            FROM users u
            LEFT JOIN contributors c ON u.contributor_id = c.id
            WHERE u.is_active = 1
            ORDER BY display_name ASC";
            
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
