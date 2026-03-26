<?php
// api/migrations/update_email_system_tables.php
require_once __DIR__ . '/../db.php';

try {
    // 1. Verification Codes Table (Enhanced)
    $pdo->exec("CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL, -- signup / reset
        status TEXT DEFAULT 'pending', -- pending / verified
        attempts INTEGER DEFAULT 0,
        ip_address TEXT,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Check if new columns exist (for robustness if already created)
    $result = $pdo->query("PRAGMA table_info(verification_codes)")->fetchAll();
    $cols = array_column($result, 'name');
    
    if (!in_array('attempts', $cols)) {
        $pdo->exec("ALTER TABLE verification_codes ADD COLUMN attempts INTEGER DEFAULT 0");
    }
    if (!in_array('ip_address', $cols)) {
        $pdo->exec("ALTER TABLE verification_codes ADD COLUMN ip_address TEXT");
    }

    // 2. Email Logs Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS email_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        status TEXT NOT NULL, -- sent / failed
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    echo "Database migrations for email system completed successfully.\n";

} catch (Exception $e) {
    echo "Error during migration: " . $e->getMessage() . "\n";
}
?>
