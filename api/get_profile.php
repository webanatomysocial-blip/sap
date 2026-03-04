<?php
/**
 * GET /api/admin/profile
 * Returns the current admin's profile data.
 */
require_once 'db.php';
require_once 'auth_check.php';

header("Content-Type: application/json");

try {
    $adminId = $_SESSION['admin_id'];
    $role = $_SESSION['role'] ?? 'admin';
    
    // Check if user has a linked contributor profile
    $stmt = $pdo->prepare("SELECT contributor_id FROM users WHERE id = ?");
    $stmt->execute([$adminId]);
    $contributorId = $stmt->fetchColumn();

    if ($contributorId) {
        // Fetch from contributors table via contributor_id link
        $stmt = $pdo->prepare("
            SELECT c.id, u.username, u.role as user_role, c.full_name, c.email, c.image as profile_image, c.short_bio as bio,
                   c.designation, c.linkedin, c.twitter_handle, c.personal_website
            FROM users u
            JOIN contributors c ON u.contributor_id = c.id
            WHERE u.id = ?
        ");
        $stmt->execute([$adminId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        // Standard fetch (no linked profile)
        $stmt = $pdo->prepare("SELECT id, username, role as user_role, full_name, email, profile_image, bio, designation, linkedin, twitter_handle, personal_website FROM users WHERE id = ?");
        $stmt->execute([$adminId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'profile_image' => $user['profile_image'],
            'bio' => $user['bio'] ?? null,
            'designation' => $user['designation'] ?? null,
            'linkedin' => $user['linkedin'] ?? null,
            'twitter_handle' => $user['twitter_handle'] ?? null,
            'personal_website' => $user['personal_website'] ?? null
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal Server Error']);
}
?>
