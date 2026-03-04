<?php
/**
 * api/recalculate_plagiarism.php - Recalculate plagiarism for a single blog
 */
require_once 'db.php';
require_once 'utils.php';

header('Content-Type: application/json');

// 1. Admin Auth Check
if (!defined('ALLOW_PUBLIC_API')) define('ALLOW_PUBLIC_API', true);
require_once 'auth_check.php';
require_once 'permission_check.php';
checkPermission('can_manage_blogs'); // Or specific permission

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$blogId = $input['blog_id'] ?? $input['id'] ?? null;

if (!$blogId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing blog ID']);
    exit;
}

try {
    // 2. Fetch Blog Content
    $stmt = $pdo->prepare("SELECT content, draft_content, submission_status FROM blogs WHERE id = ?");
    $stmt->execute([$blogId]);
    $blog = $stmt->fetch();

    if (!$blog) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Blog not found']);
        exit;
    }

    // Use draft content if it exists and is being edited, otherwise use main content
    $contentToCheck = $blog['content'];
    if ($blog['submission_status'] === 'edited' && !empty($blog['draft_content'])) {
        $contentToCheck = $blog['draft_content'];
    }

    // 3. Call API with logging
    $result = checkPlagiarismScore($contentToCheck, $blogId, $pdo);
    $newScore = $result['score'];

    if ($newScore === -1) {
        $msg = $result['error'] ?? 'Plagiarism API check failed';
        echo json_encode(['status' => 'error', 'message' => $msg]);
        exit;
    }

    // 4. Update DB
    $stmt = $pdo->prepare("UPDATE blogs SET plagiarism_score = ?, plagiarism_status = 'completed' WHERE id = ?");
    $stmt->execute([$newScore, $blogId]);

    echo json_encode([
        'status' => 'success',
        'plagiarism_score' => $newScore,
        'message' => 'Plagiarism score updated successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
