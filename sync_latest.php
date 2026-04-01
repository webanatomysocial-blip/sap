<?php
require_once 'api/db.php';

$targetFile = 'sapsecurity_expert (1).sql';
echo "Deep Sync from $targetFile Started...\n";

if (!file_exists($targetFile)) {
    die("File $targetFile not found!\n");
}

$sqlContent = file_get_contents($targetFile);

// Extract INSERT block for contributors
if (preg_match('/INSERT INTO `contributors` .*? VALUES\s+(.*?);/s', $sqlContent, $matches)) {
    $valuesBlock = $matches[1];
    preg_match_all('/\((.*?)\)(?:,|\s|$)/s', $valuesBlock, $stmt_rows);
    
    foreach ($stmt_rows[1] as $rowString) {
        $cols = str_getcsv($rowString, ",", "'", "\\");
        
        if (count($cols) >= 24) {
            $name = trim($cols[1]);
            $email = trim($cols[2]);
            $status = trim($cols[23]);

            if ($status === 'approved') {
                echo "Processing: $name ($email)...\n";
                
                // 1. Check if exists in DB
                $checkStmt = $pdo->prepare("SELECT id FROM contributors WHERE LOWER(email) = LOWER(?)");
                $checkStmt->execute([$email]);
                $dbContr = $checkStmt->fetch();
                
                if (!$dbContr) {
                    echo "  - MISSING in DB. Importing...\n";
                    $columns = "full_name, email, linkedin, country, organization, designation, role, expertise, other_expertise, 
                               years_experience, short_bio, contribution_types, proposed_topics, contributed_elsewhere, 
                               previous_work_links, preferred_frequency, primary_motivation, weekly_time, volunteer_events, 
                               product_evaluation, personal_website, twitter_handle, status, created_at, image";
                    $placeholders = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
                    
                    $insertStmt = $pdo->prepare("INSERT INTO contributors ($columns) VALUES ($placeholders)");
                    $values = array_slice($cols, 1, 25);
                    try {
                        $insertStmt->execute($values);
                        $dbId = $pdo->lastInsertId();
                        echo "  - IMPORTED as ID $dbId.\n";
                    } catch (Exception $e) {
                        echo "  - IMPORT FAILED: " . $e->getMessage() . "\n";
                        continue;
                    }
                } else {
                    $dbId = $dbContr['id'];
                }
                
                ensureUser($dbId, $name, $email, $pdo);
            }
        }
    }
} else {
    echo "Could not find contributors table in SQL file.\n";
}

function ensureUser($id, $name, $email, $pdo) {
    $userStmt = $pdo->prepare("SELECT id FROM users WHERE contributor_id = ? OR LOWER(email) = LOWER(?)");
    $userStmt->execute([$id, $email]);
    if (!$userStmt->fetch()) {
        echo "  - Creating Dashboard User...\n";
        $plainPassword = bin2hex(random_bytes(8));
        $passwordHash = password_hash($plainPassword, PASSWORD_BCRYPT);
        
        $baseUsername = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', explode('@', $email)[0]));
        $username = $baseUsername;
        $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $tries = 0;
        while ($tries < 5) {
            $stmtCheck->execute([$username]);
            if (!$stmtCheck->fetch()) break;
            $username = $baseUsername . rand(1000, 9999);
            $tries++;
        }

        try {
            $pdo->beginTransaction();
            $pdo->prepare("
                INSERT INTO users (username, password, role, contributor_id, email, full_name, is_active)
                VALUES (?, ?, 'contributor', ?, ?, ?, 1)
            ")->execute([$username, $passwordHash, $id, $email, $name]);
            $newUserId = $pdo->lastInsertId();

            $pdo->prepare("
                INSERT INTO user_permissions (user_id, can_manage_blogs, can_manage_ads, can_manage_comments, can_manage_announcements, can_review_blogs)
                VALUES (?, 1, 0, 0, 0, 0)
            ")->execute([$newUserId]);

            $pdo->commit();
            echo "    - SUCCESS! User: $username, Pass: $plainPassword\n";
        } catch (Exception $e) {
            $pdo->rollBack();
            echo "    - FAILED to create user: " . $e->getMessage() . "\n";
        }
    }
}
