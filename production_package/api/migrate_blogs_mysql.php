<?php
// api/migrate_blogs_mysql.php
// Script to migrate blog content from migration_data.json to MySQL

require_once 'db.php';

echo "Starting Blog Migration to MySQL...\n";

$dataFile = __DIR__ . '/migration_data.json';

if (!file_exists($dataFile)) {
    die("Error: migration_data.json not found. Please pack it first.\n");
}

$blogs = json_decode(file_get_contents($dataFile), true);

if (!$blogs) {
    die("Error: Could not decode migration_data.json\n");
}

foreach ($blogs as $blog) {
    try {
        $sql = "INSERT INTO blogs (id, title, slug, excerpt, content, author, date, image, category, tags, meta_title, meta_description, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
                ON DUPLICATE KEY UPDATE title=VALUES(title), excerpt=VALUES(excerpt), content=VALUES(content), image=VALUES(image), category=VALUES(category), tags=VALUES(tags)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $blog['id'], 
            $blog['title'], 
            $blog['slug'], 
            $blog['excerpt'], 
            $blog['content'], 
            $blog['author'], 
            $blog['date'], 
            $blog['image'], 
            $blog['category'], 
            $blog['tags'], 
            $blog['title'], 
            $blog['metaDescription']
        ]);
        echo "Migrated: " . $blog['title'] . "\n";
    } catch (Exception $e) {
        echo "Error migrating " . $blog['id'] . ": " . $e->getMessage() . "\n";
    }
}

echo "Migration Complete.\n";
?>
