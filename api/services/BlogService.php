<?php
/**
 * api/services/BlogService.php - Handles Blog Database Operations
 */
require_once 'CacheService.php';

class BlogService {
    private $pdo;
    private $cache;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->cache = new CacheService();
    }

    private function invalidateHomepage() {
        $this->cache->invalidate('homepage_data_public');
    }

    public function getBlogs($currentUserId, $role, $currentDateTime) {
        $isLoggedIn = !empty($currentUserId);
        $isAdmin = ($role === 'admin');
        $isContributor = ($role === 'contributor');

        $sql = "SELECT b.*, 
                       u.id as author_id, u.username as author_username, u.role as author_role,
                       COALESCE(c.full_name, u.full_name, u.username) as author_name,
                       COALESCE(c.image, u.profile_image) as author_image,
                       COALESCE(c.short_bio, u.bio) as author_bio,
                       COALESCE(c.designation, u.designation) as author_designation,
                       COALESCE(c.linkedin, u.linkedin) as author_linkedin,
                       COALESCE(c.twitter_handle, u.twitter_handle) as author_twitter,
                       COALESCE(c.personal_website, u.personal_website) as author_website
                FROM blogs b
                LEFT JOIN users u ON b.author_id = u.id
                LEFT JOIN contributors c ON u.contributor_id = c.id";
        $params = [];

        if (!$isLoggedIn) {
            // Public: Only approved/published blogs, respect scheduling
            $sql .= " WHERE b.status IN ('approved', 'published') AND b.date <= ?";
            $params[] = $currentDateTime ?: gmdate('Y-m-d H:i:s'); 
        } elseif ($isContributor) {
            // Contributor: Only their own blogs
            $sql .= " WHERE b.author_id = ?";
            $params[] = $currentUserId;
        }

        $sql .= " ORDER BY b.created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($blogs as &$b) {
            // Defensive author checks - fallback if no user/contributor found
            if (!$b['author_name']) {
                $b['author_name'] = "Guest Author";
                $b['author_image'] = "https://placehold.co/100x100?text=Author";
            }
        }

        return $blogs;
    }

    public function getBlog($idOrSlug, $currentUserId, $role, $currentDateTime) {
        $isLoggedIn = !empty($currentUserId);
        $isAdmin = ($role === 'admin');
        $isContributor = ($role === 'contributor');

        $sql = "SELECT b.*, 
                       u.id as author_id, u.username as author_username, u.role as author_role, u.email as author_email,
                       COALESCE(c.full_name, u.full_name, u.username) as author_name,
                       COALESCE(c.image, u.profile_image) as author_image,
                       COALESCE(c.short_bio, u.bio) as author_bio,
                       COALESCE(c.designation, u.designation) as author_designation,
                       COALESCE(c.linkedin, u.linkedin) as author_linkedin,
                       COALESCE(c.twitter_handle, u.twitter_handle) as author_twitter,
                       COALESCE(c.personal_website, u.personal_website) as author_website
                FROM blogs b
                LEFT JOIN users u ON b.author_id = u.id
                LEFT JOIN contributors c ON u.contributor_id = c.id
                WHERE (b.slug = ? OR b.id = ?)";
        $params = [$idOrSlug, $idOrSlug];

        if (!$isLoggedIn) {
            // Relaxed date check for single blog view: if they have the link and it's published, show it.
            // Or use a slightly more forgiving date check to account for sync delays.
            $sql .= " AND b.status IN ('approved', 'published')";
            // Removed strict date check for single post to fix "blogs not opening" due to timezone mismatch
        } elseif ($isContributor) {
            $sql .= " AND b.author_id = ?";
            $params[] = $currentUserId;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $blog = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($blog) {
            if (!$blog['author_name']) {
                $blog['author_name'] = "Guest Author";
                $blog['author_image'] = "https://placehold.co/100x100?text=Author";
            }
        }

        return $blog;
    }

    public function saveBlog($data, $currentUserId, $role, $currentDateTime) {
        $id = !empty($data['id']) ? $data['id'] : null;
        $isContributor = ($role === 'contributor');
        $isAdmin = ($role === 'admin');

        // Force Author Identity
        if ($isAdmin) {
            $author_id = (int)$currentUserId;
            $authorName = "Raghu Boddu";
        } else {
            $author_id = (int)$currentUserId;
            // Contributor username/name will be fetched via COALESCE in queries
            $authorName = $_SESSION['admin_username'] ?? 'Contributor';
        }

        // Fields
        $title = $data['title'] ?? '';
        $slug = $data['slug'] ?? '';
        $excerpt = $data['excerpt'] ?? '';
        $content = $data['content'] ?? '';
        $date = $data['date'] ?? gmdate('Y-m-d');
        $image = $data['image'] ?? '';
        $category = $data['category'] ?? '';
        $tags = $data['tags'] ?? '';
        $meta_title = $data['meta_title'] ?? '';
        $meta_description = $data['meta_description'] ?? '';
        $meta_keywords = $data['meta_keywords'] ?? '';
        $faqs = $data['faqs'] ?? [];
        $cta_title = $data['cta_title'] ?? null;
        $cta_description = $data['cta_description'] ?? null;
        $cta_button_text = $data['cta_button_text'] ?? null;
        $cta_button_link = $data['cta_button_link'] ?? null;

        // Validation
        if (empty($category) || $category === 'Select Category' || $category === 'none') {
            return ['status' => 'error', 'message' => 'Please select a valid blog category'];
        }
 
        // Calculate SEO Score
        require_once __DIR__ . '/../utils.php';
        $seoScore = calculateSeoScore($data);

        $existingPlagScore = 0;

        if ($id) {
            // Update Logic
            $stmt = $this->pdo->prepare("SELECT author_id, submission_status, status, plagiarism_score FROM blogs WHERE id = ?");
            $stmt->execute([$id]);
            $existing = $stmt->fetch();

            if (!$existing) return ['status' => 'error', 'message' => 'Blog not found'];

            $existingPlagScore = $existing['plagiarism_score'] ?? 0;

            if (!$isAdmin && $existing['author_id'] != $currentUserId) {
                return ['status' => 'error', 'message' => 'Unauthorized'];
            }

            // Edit Preservation: If blog is already approved/published AND NOT ADMIN, use draft columns
            if (in_array($existing['status'], ['approved', 'published']) && !$isAdmin) {
                $sql = "UPDATE blogs SET 
                        draft_title = ?, draft_excerpt = ?, draft_content = ?, 
                        draft_meta_title = ?, draft_meta_description = ?, draft_meta_keywords = ?,
                        draft_image = ?, draft_category = ?, draft_faqs = ?,
                        draft_cta_title = ?, draft_cta_description = ?, 
                        draft_cta_button_text = ?, draft_cta_button_link = ?,
                        seo_score = ?, plagiarism_score = ?,
                        submission_status = 'edited', updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?";
                $plagRes = checkPlagiarismScore($content, $id, $this->pdo);
                $plagScore = $plagRes['score'];
                // If failure, keep existing score. If success, use new score.
                $finalPlag = ($plagScore === -1) ? $existingPlagScore : $plagScore;
                
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([
                    $title, $excerpt, $content,
                    $meta_title, $meta_description, $meta_keywords,
                    $image, $category, json_encode($faqs),
                    $cta_title, $cta_description, $cta_button_text, $cta_button_link,
                    $seoScore, $finalPlag, $id
                ]);
                $this->invalidateHomepage();
                $msg = 'Changes saved for review. Live version remains unchanged.';
                if ($plagScore === -1) $msg .= ' (Warning: Plagiarism check failed)';
                return ['status' => 'success', 'message' => $msg, 'plagiarism_score' => $finalPlag];
            } else {
                // Traditional Update (for drafts or initial admin creation/approval)
                $targetStatus = $isAdmin ? 'approved' : 'draft';
                $subStatus = $isAdmin ? 'approved' : 'submitted';

                $sql = "UPDATE blogs SET 
                        title=?, slug=?, excerpt=?, content=?, date=?, image=?, category=?, tags=?, faqs=?,
                        cta_title=?, cta_description=?, cta_button_text=?, cta_button_link=?,
                        meta_title=?, meta_description=?, meta_keywords=?,
                        status=?, submission_status=?, rejection_feedback = NULL,
                        author_id = ?, author = ?, seo_score = ?, plagiarism_score = ?, plagiarism_status = 'completed',
                        draft_title=NULL, draft_content=NULL, draft_excerpt=NULL, draft_image=NULL, 
                        draft_category=NULL, draft_faqs=NULL, draft_meta_title=NULL, draft_meta_description=NULL,
                        draft_meta_keywords=NULL, draft_cta_title=NULL, draft_cta_description=NULL,
                        draft_cta_button_text=NULL, draft_cta_button_link=NULL
                        WHERE id=?";
                $plagRes = checkPlagiarismScore($content, $id, $this->pdo);
                $plagScore = $plagRes['score'];
                $finalPlag = ($plagScore === -1) ? $existingPlagScore : $plagScore;

                $params = [
                    $title, $slug, $excerpt, $content, $date, $image, $category, $tags, json_encode($faqs),
                    $cta_title, $cta_description, $cta_button_text, $cta_button_link,
                    $meta_title, $meta_description, $meta_keywords,
                    $targetStatus, $subStatus,
                    $author_id, $authorName, $seoScore, $finalPlag, $id
                ];
                $this->pdo->prepare($sql)->execute($params);
                $this->invalidateHomepage();
                $msg = 'Blog updated';
                if ($plagScore === -1) $msg .= ' (Warning: Plagiarism check failed)';
                return ['status' => 'success', 'message' => $msg, 'plagiarism_score' => $finalPlag];
            }
        } else {
            // Insert Logic
            $id = !empty($data['id']) ? $data['id'] : uniqid('blog_');
            $targetStatus = $isAdmin ? 'approved' : 'draft';
            $subStatus = $isAdmin ? 'approved' : 'submitted';

            $sql = "INSERT INTO blogs 
                    (id, title, slug, excerpt, content, author, author_id, date, image, category, tags, faqs,
                     cta_title, cta_description, cta_button_text, cta_button_link,
                     meta_title, meta_description, meta_keywords, status, submission_status, seo_score, plagiarism_score, plagiarism_status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')";
            $plagRes = checkPlagiarismScore($content, $id, $this->pdo);
            $plagScore = $plagRes['score'];
            $finalPlag = ($plagScore === -1) ? 0 : $plagScore; // New blog fallback is 0 (Not Checked)
            $params = [
                $id, $title, $slug, $excerpt, $content, $authorName, $author_id, $date, $image, $category, $tags, json_encode($faqs),
                $cta_title, $cta_description, $cta_button_text, $cta_button_link,
                $meta_title, $meta_description, $meta_keywords, $targetStatus, $subStatus, $seoScore, $finalPlag
            ];
            $this->pdo->prepare($sql)->execute($params);
            $this->invalidateHomepage();
            $msg = 'Blog created';
            if ($plagScore === -1) $msg .= ' (Warning: Plagiarism check failed)';
            return ['status' => 'success', 'message' => $msg, 'plagiarism_score' => $finalPlag];
        }
    }

    public function deleteBlog($id, $currentUserId, $role) {
        // Authorization & Data Fetch
        $stmt = $this->pdo->prepare("SELECT author_id, image FROM blogs WHERE id = ? OR slug = ?");
        $stmt->execute([$id, $id]);
        $blog = $stmt->fetch();

        if (!$blog) return false;
        if ($role !== 'admin' && $blog['author_id'] != $currentUserId) return false;

        // Cleanup Image
        if (!empty($blog['image'])) {
            deleteImage($blog['image']);
        }

        $stmt = $this->pdo->prepare("DELETE FROM blogs WHERE id = ? OR slug = ?");
        $res = $stmt->execute([$id, $id]);
        $this->invalidateHomepage();
        return $res;
    }
}
?>
