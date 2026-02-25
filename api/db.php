<?php
// api/db.php - MySQL/MariaDB Connection for cPanel
// Optimized for SAP Security Expert Platform

// 1. Headers for API and CORS
if (!headers_sent()) {
    // Allow local development
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

require_once __DIR__ . '/utils.php';

// 2. Load Environment Variables (Simple Implementation for cPanel compatibility)
function loadEnv($path) {
    if (!file_exists($path)) return [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $env = [];
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $env[trim($name)] = trim($value);
    }
    return $env;
}

$envFile = __DIR__ . '/.env';
$config = loadEnv($envFile);

// 3. Database Credentials (Fallback to cPanel typical defaults)
$connection = $config['DB_CONNECTION'] ?? 'mysql'; // Default to mysql

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    if ($connection === 'sqlite') {
        // SQLite Connection
        $dbPath = __DIR__ . '/database.sqlite';
        $dsn = "sqlite:$dbPath";
        $pdo = new PDO($dsn, null, null, $options);
        // Enable foreign keys for SQLite
        $pdo->exec("PRAGMA foreign_keys = ON;");
    } else {
        // MySQL Connection (Existing Logic)
        $host = $config['DB_HOST'] ?? 'localhost';
        $db   = $config['DB_NAME'] ?? '';
        $user = $config['DB_USER'] ?? '';
        $pass = $config['DB_PASS'] ?? '';
        $charset = $config['DB_CHARSET'] ?? 'utf8mb4';

        if (empty($db)) {
            throw new Exception("Database configuration missing. Please check api/.env");
        }
        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $pdo = new PDO($dsn, $user, $pass, $options);
    }
} catch (PDOException $e) {
    // If not connected, give a clear message for debugging
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Connection failed: " . $e->getMessage(),
        "hint" => "Ensure your database credentials are correct in api/.env"
    ]);
    exit;
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    exit;
}
?>
