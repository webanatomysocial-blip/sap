<?php
require_once 'api/db.php';

$username = 'admin';
$password = 'sap-security-2026';
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user) {
        // Update password
        $sql = "UPDATE users SET password = ? WHERE username = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$hashed_password, $username]);
        echo "Password updated successfully for user: $username\n";
    } else {
        // Create user
        $sql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username, $hashed_password]);
        echo "User created successfully: $username\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
