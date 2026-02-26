<?php
/**
 * api/storage.php
 * Centralized upload path resolver.
 *
 * Replaces the inline local/prod detection blocks in:
 *   - upload_blog_image.php
 *   - apply_contributor.php
 *   - upload_ad_image.php
 *
 * Usage:
 *   require_once __DIR__ . '/storage.php';
 *   $uploadDir = getUploadPath('blogs');   // returns absolute dir path
 *   $uploadDir = getUploadPath('contributors');
 *   $uploadDir = getUploadPath('ads');
 *
 * Rollback: Remove require_once and replace with original inline detection blocks.
 */

function getUploadPath(string $type): string
{
    $host    = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    $isLocal = strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false;
    $base    = $isLocal
        ? realpath(__DIR__ . '/..') . '/public/uploads/'
        : realpath(__DIR__ . '/..') . '/uploads/';

    return $base . $type . '/';
}
?>
