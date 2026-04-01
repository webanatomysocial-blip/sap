<?php
require_once 'api/db.php';

function checkTable($pdo, $table) {
    echo "Table: $table\n";
    $res = $pdo->query("PRAGMA table_info($table)");
    foreach ($res->fetchAll() as $row) {
        echo "- {$row['name']} ({$row['type']})\n";
    }
}

checkTable($pdo, 'members');
checkTable($pdo, 'users');
checkTable($pdo, 'contributors');
