<?php
// SETUP_MYSQL.php - SAP Security Expert Database Initializer
// This script helps you set up the MySQL database on cPanel.

error_reporting(E_ALL);
ini_set('display_errors', 1);

$step = $_GET['step'] ?? 'form';
$envFile = __DIR__ . '/api/.env';

function saveEnv($data) {
    $content = "";
    foreach ($data as $k => $v) {
        $content .= "$k=$v\n";
    }
    return file_put_contents(__DIR__ . '/api/.env', $content);
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAP Security Expert - MySQL Setup</title>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; display: flex; justify-content: center; }
        .card { background: #1e293b; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); width: 100%; max-width: 500px; }
        h1 { color: #38bdf8; font-size: 1.5rem; margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; color: #94a3b8; font-size: 0.9rem; }
        input { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: white; box-sizing: border-box; }
        button { background: #38bdf8; color: #0f172a; border: none; padding: 12px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 10px; }
        button:hover { background: #0ea5e9; }
        .success { color: #4ade80; background: #064e3b; padding: 10px; border-radius: 6px; margin-bottom: 20px; }
        .error { color: #f87171; background: #7f1d1d; padding: 10px; border-radius: 6px; margin-bottom: 20px; }
        pre { background: #000; padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Database Configuration</h1>

        <?php if ($step === 'form'): ?>
            <form action="?step=test" method="POST">
                <div class="form-group">
                    <label>DB Host</label>
                    <input type="text" name="DB_HOST" value="localhost" required>
                </div>
                <div class="form-group">
                    <label>Database Name</label>
                    <input type="text" name="DB_NAME" placeholder="e.g. u12345_sap_db" required>
                </div>
                <div class="form-group">
                    <label>DB Username</label>
                    <input type="text" name="DB_USER" placeholder="e.g. u12345_sap_user" required>
                </div>
                <div class="form-group">
                    <label>DB Password</label>
                    <input type="password" name="DB_PASS" required>
                </div>
                <button type="submit">Test Connection & Save</button>
            </form>

        <?php elseif ($step === 'test'): ?>
            <?php
            $data = $_POST;
            $data['DB_CHARSET'] = 'utf8mb4';
            
            try {
                $dsn = "mysql:host=" . $data['DB_HOST'] . ";dbname=" . $data['DB_NAME'] . ";charset=utf8mb4";
                $pdo = new PDO($dsn, $data['DB_USER'], $data['DB_PASS']);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                saveEnv($data);
                echo "<div class='success'>✓ Connection Successful! .env file created.</div>";
                echo "<a href='?step=run_sql'><button>Initialize Database Schema</button></a>";
            } catch (Exception $e) {
                echo "<div class='error'>Connection Failed: " . $e->getMessage() . "</div>";
                echo "<a href='?step=form'><button>Try Again</button></a>";
            }
            ?>

        <?php elseif ($step === 'run_sql'): ?>
            <?php
            require_once 'api/db.php';
            $sqlFile = 'database_schema_mysql.sql';
            if (!file_exists($sqlFile)) {
                echo "<div class='error'>Error: $sqlFile not found!</div>";
            } else {
                try {
                    $sql = file_get_contents($sqlFile);
                    $pdo->exec($sql);
                    echo "<div class='success'>✓ Database tables created successfully!</div>";
                    echo "<a href='?step=migrate'><button>Migrate Blog Content</button></a>";
                } catch (Exception $e) {
                    echo "<div class='error'>SQL Error: " . $e->getMessage() . "</div>";
                }
            }
            ?>

        <?php elseif ($step === 'migrate'): ?>
            <?php
            echo "<div class='success'>Migrating blogs...</div>";
            echo "<pre>";
            include 'api/migrate_blogs_mysql.php';
            echo "</pre>";
            echo "<div class='success'>✓ Migration Finished!</div>";
            echo "<p style='color: #94a3b8; font-size: 0.8rem;'>Important: Delete SETUP_MYSQL.php and database_schema_mysql.sql from your server now.</p>";
            echo "<a href='/'><button>Go to Website</button></a>";
            ?>
        <?php endif; ?>
    </div>
</body>
</html>
