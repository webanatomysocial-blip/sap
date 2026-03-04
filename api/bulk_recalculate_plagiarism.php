<?php
/**
 * api/bulk_recalculate_plagiarism.php - Recalculate plagiarism for all blogs with score 0
 */
require_once 'db.php';
require_once 'utils.php';

// Disable timeout for long execution
set_time_limit(300);

header('Content-Type: application/json');

// 1. Admin Auth Check
if (!defined('ALLOW_PUBLIC_API')) define('ALLOW_PUBLIC_API', true);
require_once 'auth_check.php';
require_once 'permission_check.php';
checkPermission('can_manage_blogs');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // 2. Fetch Blogs with score 0 or failure state
    $stmt = $pdo->prepare("SELECT id, content, draft_content, submission_status FROM blogs WHERE plagiarism_score = 0 OR plagiarism_score = -1");
    $stmt->execute();
    $blogs = $stmt->fetchAll();

    $total = count($blogs);
    $updated = 0;
    $failed = 0;

    foreach ($blogs as $blog) {
        $contentToCheck = $blog['content'];
        if ($blog['submission_status'] === 'edited' && !empty($blog['draft_content'])) {
            $contentToCheck = $blog['draft_content'];
        }

        $newScore = checkPlagiarismScore($contentToCheck);

        if ($newScore !== -1) {
            $updateStmt = $pdo->prepare("UPDATE blogs SET plagiarism_score = ?, plagiarism_status = 'completed' WHERE id = ?");
            $updateStmt->execute([$newScore, $blog['id']]);
            $updated++;
        } else {
            $failed++;
        }

        // Small delay to prevent API rate limiting as requested
        usleep(1500000); // 1.5 seconds
    }

    echo json_encode([
        'status' => 'success',
        'total_processed' => $total,
        'total_updated' => $updated,
        'failures' => $failed,
        'message' => "Processed $total blogs. $updated updated, $failed failed."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
