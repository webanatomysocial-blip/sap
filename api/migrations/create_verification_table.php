<?php
// api/migrations/create_verification_table.php
require_once __DIR__ . '/../db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($sql);
    echo "Table 'verification_codes' created successfully.\n";
    
    // Also ensure index for performance
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_verification_email ON verification_codes(email)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_verification_code ON verification_codes(email, code)");
    echo "Indexes created successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
