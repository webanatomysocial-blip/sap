<?php
$pdo = new PDO('sqlite:api/database.sqlite');
$tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
echo implode("\n", $tables);
