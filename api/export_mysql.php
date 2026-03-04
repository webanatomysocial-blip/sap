<?php
/**
 * api/export_mysql.php
 * 
 * Exports the local SQLite database to a MySQL-compatible .sql file for production deployment.
 * Dynamically reads the ACTUAL SQLite schema — never relies on hardcoded column lists.
 * 
 * Usage: cd /path/to/project && php api/export_mysql.php
 */

require 'db.php';

if ($connection !== 'sqlite') {
    die("This script exports from the local SQLite database only.\nYour current DB_CONNECTION is: $connection\n");
}

$outputFile = __DIR__ . '/production_database.sql';
$fp = fopen($outputFile, 'w');

function sql($line) {
    global $fp;
    fwrite($fp, $line . "\n");
}

// ── Header ────────────────────────────────────────────────────────────────────
sql("-- SAP Security Expert - MySQL Production Export");
sql("-- Generated: " . date('Y-m-d H:i:s'));
sql("-- Source: local SQLite database (schema auto-detected)");
sql("SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";");
sql("SET NAMES utf8mb4;");
sql("SET FOREIGN_KEY_CHECKS = 0;");
sql("START TRANSACTION;");
sql("SET time_zone = \"+00:00\";");
sql("");

// ── SQLite → MySQL type mapping ───────────────────────────────────────────────
function sqliteTypeToMysql($sqliteType, $colName) {
    // Special cases for indexed columns
    // SQLite's typelessness means these are often just TEXT, but MySQL requires lengths for indexes
    if ($colName === 'ip' || $colName === 'ip_address') return 'VARCHAR(45)'; // supports IPv6
    if ($colName === 'slug') return 'VARCHAR(255)';
    if ($colName === 'username') return 'VARCHAR(255)';
   if ($colName === 'post_id') return 'VARCHAR(255)';

    $t = strtoupper(trim($sqliteType ?? '')); // guard against null types from ALTER TABLE columns

    // Exact / prefix matches
    if ($t === '' || $t === 'TEXT' || $t === 'CLOB')           return 'LONGTEXT';
    if (str_starts_with($t, 'VARCHAR'))                         return $sqliteType; // keep as-is, e.g. VARCHAR(255)
    if ($t === 'INTEGER' || $t === 'INT')                       return 'INT(11)';
    if (str_starts_with($t, 'INT'))                             return 'INT(11)';
    if ($t === 'REAL' || $t === 'FLOAT' || $t === 'DOUBLE')     return 'DOUBLE';
    if ($t === 'NUMERIC' || $t === 'DECIMAL')                   return 'DECIMAL(10,2)';
    if ($t === 'BOOLEAN' || $t === 'TINYINT(1)')                return 'TINYINT(1)';
    if ($t === 'DATE')                                          return 'DATE';
    if (str_starts_with($t, 'DATETIME') || $t === 'TIMESTAMP') return 'DATETIME';
    if ($t === 'JSON')                                          return 'JSON';
    if (str_starts_with($t, 'LONGTEXT'))                        return 'LONGTEXT';
    if (str_starts_with($t, 'MEDIUMTEXT'))                      return 'MEDIUMTEXT';

    // id column heuristic
    if ($colName === 'id' && ($t === '' || $t === 'INTEGER'))   return 'INT(11)';

    return 'LONGTEXT'; // safe fallback
}

// ── Tables export order (respects FK dependencies) ───────────────────────────
// Get all table names from SQLite
$allTables = $pdo->query(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
)->fetchAll(PDO::FETCH_COLUMN);

// Tables NOT to export data for (system/log/analytics tables - reset on production)
$skipData = ['login_attempts', 'audit_logs', 'analytics', 'plagiarism_logs'];

// Tables to write in a specific safe order (parent before child)
$orderedTables = ['users', 'contributors', 'blogs', 'announcements', 'ads',
                  'comments', 'contributor_applications', 'user_permissions',
                  'post_views', 'login_attempts', 'plagiarism_logs',
                  'audit_logs', 'analytics'];

// Append any tables not in the ordered list
foreach ($allTables as $t) {
    if (!in_array($t, $orderedTables)) {
        $orderedTables[] = $t;
    }
}
// Filter to only tables that actually exist in SQLite
$orderedTables = array_filter($orderedTables, fn($t) => in_array($t, $allTables));

foreach ($orderedTables as $table) {
    sql("-- ────────────────────────────────────────────────────────────────────");
    sql("-- Table: `$table`");
    sql("-- ────────────────────────────────────────────────────────────────────");

    // Read the actual current column definitions from SQLite
    $cols = $pdo->query("PRAGMA table_info(`$table`)")->fetchAll(PDO::FETCH_ASSOC);
    $pk = null;
    $colDefs = [];
    $uniqueKeys = [];

    foreach ($cols as $col) {
        $name     = $col['name'];
        $type     = sqliteTypeToMysql($col['type'], $name);
        $notNull  = $col['notnull'] ? ' NOT NULL' : '';
        $default  = '';

        // Handle defaults
        $dflt = $col['dflt_value'];
        if ($dflt !== null && $dflt !== '' && strtoupper($dflt) !== 'NULL') {
            if (strtoupper($dflt) === 'CURRENT_TIMESTAMP') {
                $default = ' DEFAULT CURRENT_TIMESTAMP';
            } else {
                // Strip outer quotes if present
                $dfltClean = trim($dflt, "'\"");
                $default = " DEFAULT '" . addslashes($dfltClean) . "'";
                
                // MySQL Strict Mode Fix: LONGTEXT/JSON cannot have string default values.
                // If a column has a string default (like 'pending' or 'Admin'), it's a short string.
                if ($type === 'LONGTEXT' || $type === 'JSON') {
                    $type = 'VARCHAR(255)';
                }
            }
        } elseif ($col['notnull'] == 0 && $dflt === null) {
            $default = ' DEFAULT NULL';
        } elseif (($dflt ?? '') !== '' && strtoupper($dflt ?? '') === 'NULL') {
            $default = ' DEFAULT NULL';
        }

        // Primary key detection
        if ($col['pk'] > 0) {
            $pk = $name;
        }

        // Auto-increment for integer primary keys
        $autoIncrement = '';
        if ($col['pk'] > 0 && in_array(strtoupper($col['type'] ?? ''), ['INTEGER', 'INT', 'INT(11)', ''])) {
            $type = 'INT(11)';
            $autoIncrement = ' AUTO_INCREMENT';
            $notNull = ' NOT NULL';
            $default = '';
        }

        // Special: 'id' on blogs is a TEXT (uniqid), not auto-increment
        if ($name === 'id' && strtoupper($col['type']) === 'TEXT') {
            $type = 'VARCHAR(255)';
            $autoIncrement = '';
            $notNull = ' NOT NULL';
            $default = '';
        }

        // Convert JSON-like columns
        // Use LONGTEXT instead of JSON to avoid MySQL constraint failures during import
        if (
            strtoupper($col['type'] ?? '') === 'JSON' ||
            in_array($name, ['faqs', 'draft_faqs', 'tags'])
        ) {
            $type = 'LONGTEXT';
            $default = ' DEFAULT NULL';
        }

        $colDefs[] = "  `$name` $type$notNull$autoIncrement$default";

        // Add unique key for slug/zone columns
        if (in_array($name, ['slug', 'zone', 'username']) && strtoupper($col['type']) !== 'INTEGER') {
            $uniqueKeys[] = $name;
        }
    }

    // Assemble CREATE TABLE
    sql("DROP TABLE IF EXISTS `$table`;");
    $createParts = $colDefs;
    if ($pk) {
        $createParts[] = "  PRIMARY KEY (`$pk`)";
    }
    foreach ($uniqueKeys as $uk) {
        $createParts[] = "  UNIQUE KEY `{$uk}` (`{$uk}`)";
    }
    // Add useful indexes
// Add useful indexes
if ($table === 'blogs') {
    $createParts[] = "  KEY `idx_blogs_status` (`status`(20))";
    $createParts[] = "  KEY `idx_blogs_date` (`date`)";
}

if ($table === 'comments') {
    $createParts[] = "  KEY `idx_comments_post_id` (`post_id`(255))";
    $createParts[] = "  KEY `idx_comments_status` (`status`(20))";
}

if ($table === 'post_views') {
    $createParts[] = "  KEY `idx_post_views_post_id` (`post_id`)";
}

    sql("CREATE TABLE IF NOT EXISTS `$table` (");
    sql(implode(",\n", $createParts));
    sql(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    sql("");

    // ── Data Export ───────────────────────────────────────────────────────────
    if (in_array($table, $skipData)) {
        sql("-- (no data exported for `$table` — resets cleanly on production)");
        sql("");
        continue;
    }

    // Special handling: users — export full profiles but reset admin password
    if ($table === 'users') {
        $stmt = $pdo->query("SELECT * FROM users");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $hash = password_hash('sap-security-2026', PASSWORD_DEFAULT);
        
        sql("-- Exporting user profiles (resetting admin password)");
        foreach ($users as $u) {
            // Force admin password reset if it's the main admin
            if ($u['username'] === 'admin') {
                $u['password'] = $hash;
            }
            
            $colsArr = array_keys($u);
            $valsArr = array_map(function($v) use ($pdo) {
                if ($v === null) return 'NULL';
                return $pdo->quote($v);
            }, array_values($u));
            
            sql("INSERT INTO `users` (`" . implode("`, `", $colsArr) . "`) VALUES (" . implode(", ", $valsArr) . ");");
        }
        sql("");
        continue;
    }

    try {
        // Check if table exists in SQLite
        $check = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
    } catch (Exception $e) {
        sql("-- Table `$table` has no data or doesn't exist locally.");
        sql("");
        continue;
    }

    try {
        $stmt = $pdo->query("SELECT * FROM `$table`");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) {
            sql("-- (no data in `$table`)");
            sql("");
            continue;
        }

        $colNames = array_keys($rows[0]);
        $colList = implode('`, `', $colNames);

        // Build a map of which columns are JSON type for this table
        $jsonCols = [];
        foreach ($cols as $col) {
            $type = strtoupper($col['type'] ?? '');
            $name = $col['name'];

            // Detect JSON columns even if SQLite reports them as TEXT
            if ($type === 'JSON' || in_array($name, ['faq','faqs','draft_faqs','tags','meta_keywords'])) {
                $jsonCols[] = $name;
            }
        }

        // Batch into groups of 50 rows for readability
        $chunks = array_chunk($rows, 50);
        foreach ($chunks as $chunk) {
            $valueRows = [];
            foreach ($chunk as $row) {
                $rowVals = [];
            foreach ($row as $colName => $val) {
                if ($val === null) {
                    $rowVals[] = 'NULL';
                } elseif (in_array($colName, $jsonCols)) {
                    // Robust JSON Sanitization:
                    // Only export as JSON string if it's valid JSON, otherwise wrap in array or export as NULL/Empty
                    $decoded = json_decode((string)$val, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        // Re-encode to ensure clean escaping
                        $rowVals[] = $pdo->quote(json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
                    } else {
                        // Handle malformed data (like HTML or comma-separated tags)
                        if ($colName === 'tags' || $colName === 'meta_keywords') {
                            // If it's a comma list, try to make it a JSON array, or just keep as string if it's not JSON column in MySQL
                            // Actually, MySQL will treat it as LONGTEXT, so if it's not valid JSON, we just keep it as a quoted string
                            $rowVals[] = $pdo->quote((string)$val);
                        } elseif (in_array($colName, ['faqs', 'draft_faqs', 'faq'])) {
                            // FAQs must be arrays for the frontend logic
                            $rowVals[] = $pdo->quote("[]");
                        } else {
                            $rowVals[] = $pdo->quote((string)$val);
                        }
                    }
                } else {
                    $rowVals[] = $pdo->quote((string)$val);
                }
            }
                $valueRows[] = '(' . implode(', ', $rowVals) . ')';
            }
            sql("INSERT INTO `$table` (`$colList`) VALUES");
            // Join all value rows with commas, last one gets semicolon
            $lastIdx = count($valueRows) - 1;
            foreach ($valueRows as $i => $vr) {
                sql('  ' . $vr . ($i < $lastIdx ? ',' : ';'));
            }
            sql("");
        }

    } catch (PDOException $e) {
        sql("-- ERROR exporting data for `$table`: " . $e->getMessage());
        sql("");
    }
}

// ── Footer ────────────────────────────────────────────────────────────────────
sql("SET FOREIGN_KEY_CHECKS = 1;");
sql("COMMIT;");

fclose($fp);

echo "✅ Successfully exported to: $outputFile\n";
echo "   Tables exported: " . implode(', ', $orderedTables) . "\n";
echo "   Import this file via phpMyAdmin → Import tab.\n";
?>
