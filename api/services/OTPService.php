<?php
// api/services/OTPService.php

require_once __DIR__ . '/../db.php';

class OTPService {
    private $pdo;
    private $maxAttepts = 5;
    private $expiryMinutes = 10;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    /**
     * Get DB driver name (mysql or sqlite)
     */
    private function getDriver() {
        return $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    }

    /**
     * Generate and store a new OTP.
     * Uses DB-native datetime functions so expiry always matches the stored timezone.
     */
    public function generateOTP($email, $type, $ipAddress) {
        // Enforce rate limiting
        if (!$this->checkRateLimit($email, $ipAddress)) {
            throw new Exception("Too many requests. Please try again later.");
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Build expiry using DB-native SQL (no PHP date() involved)
        if ($this->getDriver() === 'sqlite') {
            $stmt = $this->pdo->prepare(
                "INSERT INTO verification_codes (email, code, type, ip_address, expires_at)
                 VALUES (?, ?, ?, ?, datetime('now', '+{$this->expiryMinutes} minutes'))"
            );
        } else {
            // MySQL / MariaDB
            $stmt = $this->pdo->prepare(
                "INSERT INTO verification_codes (email, code, type, ip_address, expires_at)
                 VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL {$this->expiryMinutes} MINUTE))"
            );
        }

        $stmt->execute([$email, $code, $type, $ipAddress]);

        return $code;
    }

    /**
     * Validate an OTP — uses DB-native NOW() for expiry comparison.
     */
    public function verifyOTP($email, $code, $type) {
        $dbNow = $this->getDriver() === 'sqlite' ? "datetime('now')" : "NOW()";

        $stmt = $this->pdo->prepare("
            SELECT id, attempts FROM verification_codes 
            WHERE email = ? AND type = ? AND status = 'pending' 
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([$email, $type]);
        $record = $stmt->fetch();

        if (!$record) {
            throw new Exception("Verification code not found or already used.");
        }

        // Check expiry using DB-native time
        $checkExpiry = $this->pdo->prepare(
            "SELECT 1 FROM verification_codes WHERE id = ? AND expires_at >= {$dbNow}"
        );
        $checkExpiry->execute([$record['id']]);
        if (!$checkExpiry->fetch()) {
            throw new Exception("Verification code has expired. Please request a new one.");
        }

        if ($record['attempts'] >= $this->maxAttepts) {
            throw new Exception("Too many failed attempts. Please request a new code.");
        }

        // Verify code match
        $stmtVerified = $this->pdo->prepare(
            "SELECT id FROM verification_codes WHERE id = ? AND code = ?"
        );
        $stmtVerified->execute([$record['id'], $code]);

        if ($stmtVerified->fetch()) {
            // Mark as verified
            $this->pdo->prepare("UPDATE verification_codes SET status = 'verified' WHERE id = ?")
                ->execute([$record['id']]);
            return true;
        } else {
            // Increment failed attempts
            $this->pdo->prepare("UPDATE verification_codes SET attempts = attempts + 1 WHERE id = ?")
                ->execute([$record['id']]);
            throw new Exception("Invalid verification code.");
        }
    }

    /**
     * Check if an email has been verified within the last 30 minutes.
     * Uses DB-native datetime so it works with both MySQL and SQLite timezones.
     */
    public function isVerified($email, $type) {
        if ($this->getDriver() === 'sqlite') {
            $since = "datetime('now', '-30 minutes')";
        } else {
            $since = "DATE_SUB(NOW(), INTERVAL 30 MINUTE)";
        }

        $stmt = $this->pdo->prepare("
            SELECT id FROM verification_codes 
            WHERE email = ? AND type = ? AND status = 'verified' 
            AND created_at >= {$since}
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([$email, $type]);
        return (bool)$stmt->fetch();
    }

    private function checkRateLimit($email, $ipAddress) {
        if ($this->getDriver() === 'sqlite') {
            $since = "datetime('now', '-1 hour')";
        } else {
            $since = "DATE_SUB(NOW(), INTERVAL 1 HOUR)";
        }

        // Max 3 OTPs per email per hour
        $stmtEmail = $this->pdo->prepare("
            SELECT COUNT(*) FROM verification_codes 
            WHERE email = ? AND created_at >= {$since}
        ");
        $stmtEmail->execute([$email]);
        if ($stmtEmail->fetchColumn() >= 3) return false;

        // Max 10 OTPs per IP per hour
        $stmtIp = $this->pdo->prepare("
            SELECT COUNT(*) FROM verification_codes 
            WHERE ip_address = ? AND created_at >= {$since}
        ");
        $stmtIp->execute([$ipAddress]);
        if ($stmtIp->fetchColumn() >= 10) return false;

        return true;
    }
}
?>
