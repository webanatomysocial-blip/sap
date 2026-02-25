<?php
/**
 * api/utils.php - Common utility functions for SAP Security Expert
 */

/**
 * Robustly deletes an image from the filesystem, handling legacy and new paths.
 * 
 * @param string $imagePath The relative path stored in DB (e.g. /uploads/blogs/img.jpg or /assets/img.jpg)
 * @return bool True if deleted, false otherwise
 */
function deleteImage($imagePath) {
    if (empty($imagePath)) {
        return false;
    }

    // Clean path (ensure it starts with / for consistency in concatenation)
    if ($imagePath[0] !== '/') {
        $imagePath = '/' . $imagePath;
    }

    $possiblePaths = [
        // 1. Direct relative to root
        __DIR__ . '/..' . $imagePath,
        
        // 2. Direct relative to public
        __DIR__ . '/../public' . $imagePath,
        
        // 3. Legacy assets handling: /assets/... -> /public/assets/...
        __DIR__ . '/../public/assets' . str_replace('/assets', '', $imagePath),
        
        // 4. Normalized uploads handling: /uploads/... -> /public/uploads/...
        __DIR__ . '/../public/uploads' . str_replace('/uploads', '', $imagePath),
        
        // 5. Old root-level assets
        __DIR__ . '/../assets' . str_replace('/assets', '', $imagePath)
    ];

    foreach ($possiblePaths as $path) {
        // Normalize slashes (windows/unix compatibility though primarily unix here)
        $normalizedPath = str_replace(['//', '\\\\'], ['/', '\\'], $path);
        
        if (file_exists($normalizedPath) && is_file($normalizedPath)) {
            if (unlink($normalizedPath)) {
                return true;
            }
        }
    }

    return false;
}
?>
