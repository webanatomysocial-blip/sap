<?php
/**
 * api/services/AuditService.php - Handles Activity Logging
 */

class AuditService {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function log($userId, $action, $targetType, $targetId, $details = '') {
        try {
            $stmt = $this->pdo->prepare(
                "INSERT INTO audit_logs (user_id, action, target_type, target_id, details) 
                 VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$userId, $action, $targetType, $targetId, $details]);
        } catch (Exception $e) {
            // Log to error log if audit table fails - don't crash the application
            error_log("Audit log failure: " . $e->getMessage());
        }
    }
}
?>
