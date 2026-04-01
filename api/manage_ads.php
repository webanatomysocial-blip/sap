<?php
// api/manage_ads.php
require_once 'db.php';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    define('ALLOW_PUBLIC_API', true);
}
require_once 'auth_check.php';
require_once 'permission_check.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    checkPermission('can_manage_ads');
}

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

// Helper to get input
$input = json_decode(file_get_contents('php://input'), true);

try {
    if ($method === 'GET') {
        // Fetch specific zone or all
        if (isset($_GET['zone'])) {
            $stmt = $pdo->prepare("SELECT * FROM ads WHERE zone = ?");
            $stmt->execute([$_GET['zone']]);
            $ad = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($ad ? $ad : ['active' => 0]); 
        } else {
            $stmt = $pdo->query("SELECT * FROM ads");
            $ads = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // Convert to object keyed by zone for frontend convenience
            $adsMap = [];
            foreach ($ads as $ad) {
                $adsMap[$ad['zone']] = $ad;
            }
            echo json_encode($adsMap);
        }
    } elseif ($method === 'POST') {
        // Create or Update Ad
        // Expected: { zone: 'home_left', image: '...', link: '...', active: true/false }
        
        if (!isset($input['zone'])) {
            throw new Exception("Zone is required");
        }

        $zone = $input['zone'];
        $image = $input['image'] ?? '';
        $link = $input['link'] ?? '';
        $active = isset($input['active']) && $input['active'] ? 1 : 0;

        // Check if exists
        $check = $pdo->prepare("SELECT id FROM ads WHERE zone = ?");
        $check->execute([$zone]);
        $exists = $check->fetch();

        if ($exists) {
            // Fetch current image to delete if changing
            $stmt = $pdo->prepare("SELECT image, link FROM ads WHERE zone = ?");
            $stmt->execute([$zone]);
            $current = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $resetClicks = false;
            // Detect change to reset click count
            if ($current) {
                if ($current['image'] !== $image && !empty($image)) {
                    if (!empty($current['image'])) {
                        deleteImage($current['image']);
                    }
                    $resetClicks = true;
                }
                if ($current['link'] !== $link) {
                    $resetClicks = true;
                }
            }

            if ($resetClicks) {
                // Reset clicks to 0 if ad content changed
                $stmt = $pdo->prepare("UPDATE ads SET image = ?, link = ?, active = ?, status = ?, clicks = 0 WHERE zone = ?");
                $stmt->execute([$image, $link, $active, $active ? 'active' : 'inactive', $zone]);
            } else {
                $stmt = $pdo->prepare("UPDATE ads SET image = ?, link = ?, active = ?, status = ? WHERE zone = ?");
                $stmt->execute([$image, $link, $active, $active ? 'active' : 'inactive', $zone]);
            }
        } else {
            $stmt = $pdo->prepare("INSERT INTO ads (zone, image, link, active, status, clicks) VALUES (?, ?, ?, ?, ?, 0)");
            $stmt->execute([$zone, $image, $link, $active, $active ? 'active' : 'inactive']);
        }

        echo json_encode(['status' => 'success', 'message' => 'Ad updated']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
