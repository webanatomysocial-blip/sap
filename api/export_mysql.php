<?php
// api/export_mysql.php
// Utility script to export SQLite data to a MySQL compatible .sql file

require 'db.php'; // This connects to database.sqlite based on .env

if ($connection !== 'sqlite') {
    die("This script is designed to export from the local SQLite database. Your current connection is set to: $connection\n");
}

$outputFile = __DIR__ . '/production_database.sql';
$fp = fopen($outputFile, 'w');

function writeLine($line) {
    global $fp;
    fwrite($fp, $line . "\n");
}

writeLine("-- SAP Security Expert - MySQL Production Export");
writeLine("-- Generated: " . date('Y-m-d H:i:s'));
writeLine("SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";");
writeLine("START TRANSACTION;");
writeLine("SET time_zone = \"+00:00\";\n");

// 1. Export Schema
$tables = [
    'users' => [
        "CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'admin',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ],
    'blogs' => [
        "CREATE TABLE IF NOT EXISTS `blogs` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `author` varchar(100) DEFAULT 'Admin',
  `date` date DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'sap-security',
  `subCategory` varchar(50) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `view_count` int(11) DEFAULT 0,
  `meta_title` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'published',
  `created_at` datetime DEFAULT current_timestamp(),
  `faq` text DEFAULT NULL,
  `cta_title` varchar(255) DEFAULT NULL,
  `cta_description` text DEFAULT NULL,
  `cta_button_text` varchar(100) DEFAULT NULL,
  `cta_button_link` varchar(255) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `faqs` json DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ],
    'comments' => [
        "CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` varchar(255) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `content` text NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `timestamp` datetime DEFAULT current_timestamp(),
  `edited_at` datetime DEFAULT NULL,
  `original_text` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ],
    'contributors' => [
        "CREATE TABLE IF NOT EXISTS `contributors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `linkedin` text DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `expertise` text DEFAULT NULL,
  `other_expertise` text DEFAULT NULL,
  `years_experience` varchar(50) DEFAULT NULL,
  `short_bio` text DEFAULT NULL,
  `contribution_types` text DEFAULT NULL,
  `proposed_topics` text DEFAULT NULL,
  `contributed_elsewhere` varchar(100) DEFAULT NULL,
  `previous_work_links` text DEFAULT NULL,
  `preferred_frequency` varchar(50) DEFAULT NULL,
  `primary_motivation` text DEFAULT NULL,
  `weekly_time` varchar(50) DEFAULT NULL,
  `volunteer_events` varchar(50) DEFAULT NULL,
  `product_evaluation` varchar(50) DEFAULT NULL,
  `personal_website` text DEFAULT NULL,
  `twitter_handle` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `image` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ],
    'announcements' => [
        "CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `views` int(11) DEFAULT 0,
  `comments` int(11) DEFAULT 0,
  `link` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ],
    'ads' => [
        "CREATE TABLE IF NOT EXISTS `ads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zone` varchar(100) NOT NULL,
  `image` text DEFAULT NULL,
  `link` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'active',
  `title` text DEFAULT NULL,
  `ad_size` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `zone` (`zone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ],
    'post_views' => [
        "CREATE TABLE IF NOT EXISTS `post_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `visitor_token` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ],
    'contributor_applications' => [
        "CREATE TABLE IF NOT EXISTS `contributor_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ],
    'post_views' => [
        "CREATE TABLE IF NOT EXISTS `post_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `view_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_view` (`post_id`, `ip_address`, `view_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ],
    'blog_views' => [
        "CREATE TABLE IF NOT EXISTS `blog_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blog_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ],
    'analytics' => [
        "CREATE TABLE IF NOT EXISTS `analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `metric_name` varchar(100) NOT NULL,
  `metric_value` int(11) NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    ]
];

foreach ($tables as $table => $schemaArr) {
    writeLine("-- Table structure for table `$table`");
    writeLine("DROP TABLE IF EXISTS `$table`;");
    writeLine($schemaArr[0]);
    writeLine("");
}

// 2. Export Data
foreach (array_keys($tables) as $table) {
    writeLine("-- Dumping data for table `$table`");
    
    // Override users table export to enforce specific admin credentials as requested
    if ($table === 'users') {
        // Hash for 'sap-security-2026'
        $hash = password_hash('sap-security-2026', PASSWORD_DEFAULT);
        writeLine("INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES (1, 'admin', '$hash', 'admin');");
        writeLine("");
        continue;
    }

    try {
        $stmt = $pdo->query("SELECT * FROM $table");
        if ($stmt) {
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($rows) > 0) {
                foreach ($rows as $row) {
                    $cols = array_keys($row);
                    $vals = array_values($row);
                    
                    // Escape values for MySQL
                    $escapedVals = array_map(function($val) use ($pdo) {
                        if ($val === null) return 'NULL';
                        return $pdo->quote($val); 
                    }, $vals);
                    
                    $colString = "`" . implode("`, `", $cols) . "`";
                    $valString = implode(", ", $escapedVals);
                    
                    writeLine("INSERT INTO `$table` ($colString) VALUES ($valString);");
                }
                writeLine("");
            }
        }
    } catch (PDOException $e) {
        // Table might be defined in schema but not exist locally, skip data dump
        writeLine("-- Note: No local data exported for `$table` (" . $e->getMessage() . ")");
        writeLine("");
    }
}

writeLine("COMMIT;");
fclose($fp);

echo "Successfully exported SQLite database to MySQL format at: $outputFile\n";
echo "You can import 'api/production_database.sql' into your live phpMyAdmin.\n";
?>
