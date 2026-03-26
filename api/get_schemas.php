<?php
$pdo = new PDO('sqlite:api/database.sqlite');
$tables = ['verification_codes', 'members', 'email_logs'];
foreach ($tables as $t) {
    $r = $pdo->query("SELECT sql FROM sqlite_master WHERE name='$t'")->fetch();
    echo "--- $t ---\n";
    echo ($r['sql'] ?? "NOT FOUND") . "\n\n";
}
