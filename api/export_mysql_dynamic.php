<?php
// api/export_mysql_dynamic.php
// Dynamically generates MySQL schema directly from SQLite metadata to completely eliminate mismatch errors.

require 'db.php'; 

if ($connection !== 'sqlite') {
    die("This script requires the SQLite connection.\n");
}

$outputFile = __DIR__ . '/production_database.sql';
$fp = fopen($outputFile, 'w');

function writeLine($line) {
    global $fp;
    fwrite($fp, $line . "\n");
}

writeLine("-- SAP Security Expert - DYNAMIC MySQL Production Export");
writeLine("-- Generated: " . date('Y-m-d H:i:s'));
writeLine("SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";");
writeLine("START TRANSACTION;");
writeLine("SET time_zone = \"+00:00\";\n");

// Get all tables
$query = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
$tables = $query->fetchAll(PDO::FETCH_COLUMN);

foreach ($tables as $table) {
    writeLine("-- --------------------------------------------------------");
    writeLine("-- Table structure for table `$table`");
    writeLine("DROP TABLE IF EXISTS `$table`;");
    
    $cols = $pdo->query("PRAGMA table_info(`$table`)")->fetchAll(PDO::FETCH_ASSOC);
    $creates = [];
    $pk = '';
    
    foreach ($cols as $col) {
        $name = $col['name'];
        $type = strtoupper($col['type']);
        
        // Map SQLite types to MySQL
        if (strpos($type, 'INT') !== false) {
            $mtype = 'int(11)';
        } else if (strpos($type, 'DATE') !== false || strpos($type, 'TIME') !== false) {
            $mtype = 'datetime';
        } else if (strpos($type, 'JSON') !== false) {
            $mtype = 'json';
        } else if (strpos($type, 'VARCHAR') !== false) {
            $mtype = 'varchar(255)';
        } else if (strpos($type, 'TEXT') !== false) {
             $mtype = 'longtext';
        } else {
            // Default to longtext to prevent truncation
            $mtype = 'longtext'; 
        }
        
        // AUTO_INCREMENT mapping for integer primary keys
        if ($name === 'id' && $mtype === 'int(11)') {
            $mtype = 'int(11) NOT NULL AUTO_INCREMENT';
        } else if ($name === 'id' && $mtype === 'longtext') {
            $mtype = 'varchar(255) NOT NULL'; // If ID is a string, make it varchar for primary key
        }
        
        $creates[] = "  `$name` $mtype";
        if ($col['pk'] == 1) {
            $pk = $name;
        }
    }
    
    $createStr = "CREATE TABLE IF NOT EXISTS `$table` (\n" . implode(",\n", $creates);
    if ($pk) {
        $createStr .= ",\n  PRIMARY KEY (`$pk`)";
    }
    $createStr .= "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    
    writeLine($createStr);
    writeLine("");
    
    // Export Data
    writeLine("-- Dumping data for table `$table`");
    $stmt = $pdo->query("SELECT * FROM `$table`");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($rows) > 0) {
        foreach ($rows as $row) {
            // ENFORCE ADMIN CREDENTIALS OVERRIDE
            if ($table === 'users' && $row['username'] === 'admin') {
                // Ensure the property is 'password' not 'password_hash' due to exact SQLite schema match
                if (isset($row['password'])) {
                    $row['password'] = password_hash('sap-security-2026', PASSWORD_DEFAULT);
                }
            }
        
            $colNames = array_keys($row);
            $vals = array_values($row);
            
            // Escape values safely for MySQL insertion
            $escapedVals = array_map(function($val) use ($pdo) {
                if ($val === null) return 'NULL';
                return $pdo->quote($val); 
            }, $vals);
            
            $colString = "`" . implode("`, `", $colNames) . "`";
            $valString = implode(", ", $escapedVals);
            
            writeLine("INSERT INTO `$table` ($colString) VALUES ($valString);");
        }
    }
    writeLine("");
}

writeLine("COMMIT;");
fclose($fp);

echo "Successfully completed dynamic export to $outputFile\n";
?>
