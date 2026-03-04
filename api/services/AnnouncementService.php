<?php
require_once 'CacheService.php';

class AnnouncementService {
    private $pdo;
    private $cache;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->cache = new CacheService();
    }

    private function invalidateHomepage() {
        $this->cache->invalidate('homepage_data_public');
    }

    public function getAnnouncements($isAdmin, $currentDateTime) {
        $sql = "SELECT * FROM announcements";
        $params = [];
        
        if (!$isAdmin) {
            // Public: Only approved/active
            $sql .= " WHERE status IN ('approved', 'active', 'published')";
        }
        
        $sql .= " ORDER BY created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveAnnouncement($data, $isAdmin, $currentDateTime) {
        $id = $data['id'] ?? null;
        $title = $data['title'] ?? '';
        $date = $data['date'] ?? gmdate('Y-m-d');
        $link = $data['link'] ?? '';

        require_once __DIR__ . '/../utils.php';
        $seoScore = calculateSeoScore($data);
        $existingPlagScore = 0;

        if ($id) {
            // Update
            $stmt = $this->pdo->prepare("SELECT submission_status, status, plagiarism_score FROM announcements WHERE id = ?");
            $stmt->execute([$id]);
            $existing = $stmt->fetch();

            if (!$existing) return ['status' => 'error', 'message' => 'Announcement not found'];
            $existingPlagScore = $existing['plagiarism_score'] ?? 0;

            if ($existing['status'] === 'approved' && !$isAdmin) {
                // EDIT PRESERVATION (For Contributors)
                $stmt = $this->pdo->prepare("UPDATE announcements SET draft_title=?, draft_date=?, draft_link=?, submission_status='edited', seo_score=?, plagiarism_score=? WHERE id=?");
                $plagScore = checkPlagiarismScore($title . ' ' . $link, $existingPlagScore);
                $stmt->execute([$title, $date, $link, $seoScore, $plagScore, $id]);
                $this->invalidateHomepage();
                return ['status' => 'success', 'message' => 'Changes saved for review. Live version remains unchanged.'];
            } else {
                $status = $isAdmin ? 'approved' : 'draft';
                $stmt = $this->pdo->prepare("UPDATE announcements SET title=?, date=?, link=?, status=?, submission_status='approved', seo_score=?, plagiarism_score=? WHERE id=?");
                $plagScore = checkPlagiarismScore($title . ' ' . $link);
                $stmt->execute([$title, $date, $link, $status, $seoScore, $plagScore, $id]);
                $this->invalidateHomepage();
                return ['status' => 'success', 'message' => 'Announcement updated'];
            }
        } else {
            // Insert
            $status = $isAdmin ? 'approved' : 'draft';
            $stmt = $this->pdo->prepare("INSERT INTO announcements (title, date, link, status, views, comments, submission_status, seo_score, plagiarism_score) VALUES (?, ?, ?, ?, 0, 0, 'approved', ?, ?)");
            $plagScore = checkPlagiarismScore($title . ' ' . $link);
            $stmt->execute([$title, $date, $link, $status, $seoScore, $plagScore]);
            $this->invalidateHomepage();
            return ['status' => 'success', 'message' => 'Announcement created'];
        }
    }

    public function reviewAnnouncement($id, $action) {
        $stmt = $this->pdo->prepare("SELECT * FROM announcements WHERE id = ?");
        $stmt->execute([$id]);
        $ann = $stmt->fetch();

        if (!$ann) return ['status' => 'error', 'message' => 'Not found'];

        if ($action === 'approve') {
            if ($ann['submission_status'] === 'edited') {
                $stmt = $this->pdo->prepare("UPDATE announcements SET title=COALESCE(draft_title, title), date=COALESCE(draft_date, date), link=COALESCE(draft_link, link), draft_title=NULL, draft_date=NULL, draft_link=NULL, submission_status='approved', status='approved' WHERE id=?");
                $stmt->execute([$id]);
            } else {
                $stmt = $this->pdo->prepare("UPDATE announcements SET submission_status='approved', status='approved' WHERE id=?");
                $stmt->execute([$id]);
            }
            $this->invalidateHomepage();
            return ['status' => 'success', 'message' => 'Approved'];
        } else {
            if ($ann['submission_status'] === 'edited') {
                $stmt = $this->pdo->prepare("UPDATE announcements SET draft_title=NULL, draft_date=NULL, draft_link=NULL, submission_status='approved' WHERE id=?");
                $stmt->execute([$id]);
            } else {
                $stmt = $this->pdo->prepare("DELETE FROM announcements WHERE id=?");
                $stmt->execute([$id]);
            }
            $this->invalidateHomepage();
            return ['status' => 'success', 'message' => 'Rejected'];
        }
    }

    public function deleteAnnouncement($id) {
        $stmt = $this->pdo->prepare("DELETE FROM announcements WHERE id = ?");
        $res = $stmt->execute([$id]);
        $this->invalidateHomepage();
        return $res;
    }
}
?>
