<?php
// scripts/pack_migration_data.php
// Run this locally: php scripts/pack_migration_data.php

$metadataFile = 'src/blogs/metadata.js';
$contentDir = 'src/blog-content/';
$outputFile = 'api/migration_data.json';

if (!file_exists($metadataFile)) {
    die("Error: metadata.js not found at $metadataFile\n");
}

$metadataContent = file_get_contents($metadataFile);
preg_match_all('/\{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*metaDescription:\s*"([^"]+)",\s*excerpt:\s*"([^"]+)",.*?\}/s', $metadataContent, $matches, PREG_SET_ORDER);

$migrationData = [];

foreach ($matches as $m) {
    $id = $m[1];
    $title = $m[2];
    $slug = $m[3];
    $metaDescription = $m[4];
    $excerpt = $m[5];
    
    preg_match('/date:\s*"([^"]+)"/', $m[0], $dateMatch);
    $date = $dateMatch[1] ?? date('Y-m-d');
    
    preg_match('/category:\s*"([^"]+)"/', $m[0], $catMatch);
    $category = $catMatch[1] ?? 'sap-security';
    
    preg_match('/author:\s*"([^"]+)"/', $m[0], $authorMatch);
    $author = $authorMatch[1] ?? 'Admin';
    
    preg_match('/tags:\s*\[(.*?)\]/s', $m[0], $tagsMatch);
    $tags = isset($tagsMatch[1]) ? str_replace(['"', "'", "\n", " "], '', $tagsMatch[1]) : '';

    $contentFile = $contentDir . $id . '.jsx';
    $blogContent = '';
    if (file_exists($contentFile)) {
        $jsx = file_get_contents($contentFile);
        if (preg_match('/content=\{\s*<>\s*(.*?)\s*<>\s*\}/s', $jsx, $contentMatch)) {
            $blogContent = $contentMatch[1];
        } elseif (preg_match('/content=\{\s*(.*?)\s*\}\s*\/>/s', $jsx, $contentMatch)) {
             $blogContent = $contentMatch[1];
        }
        $blogContent = str_replace('className=', 'class=', $blogContent);
        $blogContent = preg_replace('/style=\{\{\s*[^}]+\s*\}\}/s', '', $blogContent);
    }

    $migrationData[] = [
        'id' => $id,
        'title' => $title,
        'slug' => $slug,
        'metaDescription' => $metaDescription,
        'excerpt' => $excerpt,
        'date' => $date,
        'category' => $category,
        'author' => $author,
        'tags' => $tags,
        'content' => $blogContent,
        'image' => "/assets/blogs/" . $slug . ".jpg"
    ];
}

file_put_contents($outputFile, json_encode($migrationData, JSON_PRETTY_PRINT));
echo "Successfully packed " . count($migrationData) . " blogs into $outputFile\n";
?>
