<?php
/**
 * sync_identities.php
 * Use this script to reconcile Contributors, Dashboard Users, and Frontend Members.
 */
require_once 'api/db.php';

// --- SECURITY CHECK ---
// To prevent random people from running this, we require a secret token.
$secret = 'sap_sync_2026';
$inputToken = $_GET['token'] ?? (isset($argv[1]) ? $argv[1] : '');

if ($inputToken !== $secret) {
    die("Access Denied. Please provide the valid security token. Usage: sync_identities.php?token=$secret");
}

$isWeb = (php_sapi_name() !== 'cli');
$br = $isWeb ? "<br>" : "\n";

echo "Identity Synchronization Started...$br";
echo "<b>Warning: Delete this file from your server after running it!</b>$br$br";

try {
    $pdo->beginTransaction();

    // 1. Fetch all approved contributors
    $stmt = $pdo->query("SELECT * FROM contributors WHERE status = 'approved'");
    $contributors = $stmt->fetchAll();
    echo "Found " . count($contributors) . " approved contributors.\n";

    foreach ($contributors as $c) {
        $email = trim($c['email']);
        $fullName = trim($c['full_name']);
        echo "Processing: $fullName ($email)...$br";

        // --- DASHBOARD USER (users table) ---
        $stmtU = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR contributor_id = ? LIMIT 1");
        $stmtU->execute([$email, $c['id']]);
        $user = $stmtU->fetch();

        if (!$user) {
            echo "  - Creating MISSING Dashboard User record...$br";
            // Generate a default temporary password
            $tempPass = 'SapSecurity@' . rand(1000, 9999);
            $hash = password_hash($tempPass, PASSWORD_BCRYPT);
            
            // Create username from email
            $baseUsername = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', explode('@', $email)[0]));
            $username = $baseUsername;
            $tries = 0;
            while ($tries < 5) {
                $check = $pdo->prepare("SELECT id FROM users WHERE username = ?");
                $check->execute([$username]);
                if (!$check->fetch()) break;
                $username = $baseUsername . rand(100, 999);
                $tries++;
            }

            $pdo->prepare("INSERT INTO users (username, password, role, contributor_id, email, full_name, is_active) VALUES (?, ?, 'contributor', ?, ?, ?, 1)")
                ->execute([$username, $hash, $c['id'], $email, $fullName]);
            
            $newUserId = $pdo->lastInsertId();
            $pdo->prepare("INSERT INTO user_permissions (user_id, can_manage_blogs) VALUES (?, 1)")->execute([$newUserId]);
            
            echo "    - Dashboard Account Created! User: $username, Temp Pass: $tempPass$br";
            
            // Re-fetch user so we have the hash for member sync
            $stmtU->execute([$email, $c['id']]);
            $user = $stmtU->fetch();
        } else {
            // Already has a user record. Ensure contributor_id is linked.
            if (empty($user['contributor_id']) || empty($user['email'])) {
                echo "  - Updating existing User record with contributor info...$br";
                $pdo->prepare("UPDATE users SET contributor_id = ?, email = ? WHERE id = ?")->execute([$c['id'], $email, $user['id']]);
            }
        }

        // --- FRONTEND MEMBER (members table) ---
        $stmtM = $pdo->prepare("SELECT * FROM members WHERE LOWER(email) = LOWER(?) LIMIT 1");
        $stmtM->execute([$email]);
        $member = $stmtM->fetch();

        if (!$member) {
            echo "  - Creating MISSING Member record...$br";
            // Use the password hash from the user table so they have the SAME login
            $memberHash = $user['password'];
            
            $pdo->prepare("INSERT INTO members (name, email, password_hash, status, approved_at, profile_image) VALUES (?, ?, ?, 'approved', CURRENT_TIMESTAMP, ?)")
                ->execute([$fullName, $email, $memberHash, $c['image']]);
            
            echo "    - Member Record Created! (Email: $email)$br";
        } else {
            // Synchronize password
            if ($member['password_hash'] !== $user['password']) {
                echo "  - Synchronizing Member password to match Dashboard password...$br";
                $pdo->prepare("UPDATE members SET password_hash = ? WHERE id = ?")->execute([$user['password'], $member['id']]);
            }
            if ($member['status'] !== 'approved') {
                echo "  - Marking non-approved member as 'approved' (since they are an approved contributor)...$br";
                $pdo->prepare("UPDATE members SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?")->execute([$member['id']]);
            }
        }
    }

    $pdo->commit();
    echo "$br<b>SUCCESS: All approved contributors are now synchronized with user and member logins.</b>$br";

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo "$br<b>FATAL ERROR:</b> " . $e->getMessage() . "$br";
}
