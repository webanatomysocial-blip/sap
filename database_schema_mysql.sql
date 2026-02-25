-- Final Consolidated Database Schema for SAP Security Expert
-- Optimized for MySQL/MariaDB (cPanel Hosting)
-- FIXED: Included all extended columns from SQLite (subCategory, faq, ads metadata, etc.)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

-- Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin', 'editor') DEFAULT 'editor',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `blogs`
DROP TABLE IF EXISTS `blogs`;
CREATE TABLE `blogs` (
  `id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `author` varchar(100) DEFAULT 'Admin',
  `date` date DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT 'sap-security',
  `subCategory` varchar(100) DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `view_count` int(11) DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `status` enum('draft', 'published') DEFAULT 'published',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `faq` text DEFAULT NULL,
  `cta_title` varchar(255) DEFAULT NULL,
  `cta_description` text DEFAULT NULL,
  `cta_button_text` varchar(100) DEFAULT NULL,
  `cta_button_link` varchar(255) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `faqs` longtext DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_category` (`category`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `comments`
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` varchar(100) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `user_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `content` text NOT NULL,
  `status` enum('pending', 'approved', 'rejected') DEFAULT 'pending',
  `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
  `edited_at` timestamp NULL DEFAULT NULL,
  `original_text` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `contributors`
DROP TABLE IF EXISTS `contributors`;
CREATE TABLE `contributors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `expertise` text DEFAULT NULL,
  `other_expertise` text DEFAULT NULL,
  `years_experience` varchar(50) DEFAULT NULL,
  `short_bio` text DEFAULT NULL,
  `contribution_types` text DEFAULT NULL,
  `proposed_topics` text DEFAULT NULL,
  `contributed_elsewhere` text DEFAULT NULL,
  `previous_work_links` text DEFAULT NULL,
  `preferred_frequency` varchar(100) DEFAULT NULL,
  `primary_motivation` text DEFAULT NULL,
  `weekly_time` varchar(50) DEFAULT NULL,
  `volunteer_events` text DEFAULT NULL,
  `product_evaluation` text DEFAULT NULL,
  `personal_website` varchar(255) DEFAULT NULL,
  `twitter_handle` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `analytics`
DROP TABLE IF EXISTS `analytics`;
CREATE TABLE `analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` varchar(100) DEFAULT NULL,
  `ip_hash` varchar(64) DEFAULT NULL,
  `event_type` varchar(50) DEFAULT 'view',
  `path` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `post_views`
DROP TABLE IF EXISTS `post_views`;
CREATE TABLE `post_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` varchar(100) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `visitor_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_visitor` (`post_id`, `visitor_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `announcements`
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `views` int(11) DEFAULT 0,
  `comments` int(11) DEFAULT 0,
  `link` varchar(255) DEFAULT NULL,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(100) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `priority` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `ads`
DROP TABLE IF EXISTS `ads`;
CREATE TABLE `ads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zone` varchar(100) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'active',
  `title` varchar(255) DEFAULT NULL,
  `ad_size` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `zone` (`zone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin (Change password immediately in cPanel phpMyAdmin!)
-- Default Credentials: admin / sap-security-2026
INSERT IGNORE INTO `users` (`username`, `password`, `role`) VALUES 
('admin', '$2y$12$dhXL13Y74enBjfq.DZGWAe.CAkgJ5UCCc1FLvPYbt7W5tTYj9vZi6', 'admin');

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
