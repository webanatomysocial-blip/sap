<?php
// api/manage_ads.php
require_once 'db.php';

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
            $stmt = $pdo->prepare("SELECT image FROM ads WHERE zone = ?");
            $stmt->execute([$zone]);
            $current = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($current && !empty($current['image']) && $current['image'] !== $image && !empty($image)) {
                 $possiblePaths = [
                    __DIR__ . '/../public' . $current['image'],
                    __DIR__ . '/..' . $current['image']
                 ];
                 foreach($possiblePaths as $p) {
                    if (file_exists($p) && is_file($p)) {
                        unlink($p);
                        break;
                    }
                 }
            }

            $stmt = $pdo->prepare("UPDATE ads SET image = ?, link = ?, active = ? WHERE zone = ?");
            $stmt->execute([$image, $link, $active, $zone]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO ads (zone, image, link, active) VALUES (?, ?, ?, ?)");
            $stmt->execute([$zone, $image, $link, $active]);
        }

        echo json_encode(['status' => 'success', 'message' => 'Ad updated']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
