<?php
require_once 'api/db.php';
$emails = $pdo->query("SELECT email FROM members")->fetchAll(PDO::FETCH_COLUMN);
echo implode("\n", $emails);
