<?php
/**
 * api/check_live_setup.php
 * Run this on the live server (https://sapsecurityexpert.com/api/check_live_setup.php)
 * to verify your production configuration.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>SAP Security Expert - Live Setup Check</h1>";
echo "<pre>";

// 1. Check .env file
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    echo "✅ .env file exists.\n";
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (stripos($line, 'PASS') !== false || stripos($line, 'USER') !== false || stripos($line, 'TOKEN') !== false) {
             // Mask confidential info
             list($key, $val) = explode('=', $line, 2);
             echo "$key = ******** (Masked)\n";
        } else {
             echo "$line\n";
        }
    }
} else {
    echo "❌ .env file MISSING at $envPath.\n";
}

// 2. Check Database Connection
echo "\n--- Database Check ---\n";
try {
    require_once 'db.php';
    if (isset($pdo)) {
        echo "✅ PDO connection initialized.\n";
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo "✅ Tables found: " . implode(", ", $tables) . "\n";
        
        $requiredTables = ['verification_codes', 'email_logs', 'members', 'contributors'];
        foreach ($requiredTables as $rt) {
            if (in_array($rt, $tables)) {
                 echo "   - Table $rt: [OK]\n";
            } else {
                 echo "   - Table $rt: [MISSING] ❌\n";
            }
        }
    } else {
        echo "❌ \$pdo global variable is not set.\n";
    }
} catch (Exception $e) {
    echo "❌ DB Connection Error: " . $e->getMessage() . "\n";
}

// 3. Check Vendor/Autoload
echo "\n--- Autoload Check ---\n";
$autoloadPaths = [
    __DIR__ . '/../../vendor/autoload.php',
    __DIR__ . '/../vendor/autoload.php',
];
$foundAutoload = null;
foreach ($autoloadPaths as $path) {
    if (file_exists($path)) { $foundAutoload = $path; break; }
}

if ($foundAutoload) {
    echo "✅ Autoload detected at $foundAutoload\n";
    require_once $foundAutoload;
    if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        echo "✅ PHPMailer class is loaded.\n";
    } else {
        echo "❌ PHPMailer class NOT found.\n";
    }
} else {
    echo "❌ Autoload MISSING at $autoloadPath. Did you upload the 'vendor' folder to the server root?\n";
}

// 4. Check Folder Permissions
echo "\n--- Folder Permissions ---\n";
$folders = ['../uploads', '../uploads/blogs', '../uploads/contributors', '../uploads/ads', 'logs'];
foreach ($folders as $f) {
    $path = __DIR__ . '/' . $f;
    if (file_exists($path)) {
        if (is_writable($path)) {
            echo "✅ $f: [WRITABLE]\n";
        } else {
            echo "❌ $f: [NOT WRITABLE] - Change to 755 or 777\n";
        }
    } else {
        echo "❌ $f: [MISSING]\n";
    }
}

echo "</pre>";
