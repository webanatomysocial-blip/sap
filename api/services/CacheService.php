<?php
/**
 * api/services/CacheService.php - Simple File-based Caching
 * 
 * Uses atomic write (temp file + rename) to prevent partial reads
 * under concurrent request conditions.
 */

class CacheService {
    private $cacheDir;
    private $ttl;

    public function __construct($ttl = 3600) {
        $this->cacheDir = __DIR__ . '/../../cache/';
        $this->ttl = $ttl;

        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }

    public function get($key) {
        $filename = $this->cacheDir . md5($key) . '.cache';
        if (file_exists($filename) && (time() - filemtime($filename)) < $this->ttl) {
            $data = @file_get_contents($filename);
            // Return null if file read fails (e.g. concurrent deletion)
            return $data !== false ? $data : null;
        }
        return null;
    }

    /**
     * Atomic write: write to a temp file first, then rename.
     * rename() is atomic on Unix — readers never see a partial file.
     */
    public function set($key, $data) {
        $filename = $this->cacheDir . md5($key) . '.cache';
        $tmpFile  = $filename . '.tmp.' . getmypid();

        // Write to temp file
        if (@file_put_contents($tmpFile, $data, LOCK_EX) !== false) {
            // Atomically replace the cache file
            if (!@rename($tmpFile, $filename)) {
                @unlink($tmpFile); // Clean up on rename failure
            }
        }
    }

    public function invalidate($key = null) {
        if ($key) {
            $filename = $this->cacheDir . md5($key) . '.cache';
            if (file_exists($filename)) {
                @unlink($filename);
            }
        } else {
            // Invalidate all cache files
            $files = glob($this->cacheDir . '*.cache');
            if ($files) {
                foreach ($files as $file) {
                    if (is_file($file)) {
                        @unlink($file);
                    }
                }
            }
        }
    }
}
?>
