-- ============================================================
-- Food AI Rescue - Database Schema
-- Satu file SQL lengkap untuk semua tabel
-- Dibuat otomatis oleh setupDatabase.js saat server pertama kali dijalankan
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Tabel: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` enum('INDIVIDUAL_DONOR','CORPORATE_DONOR','RECIPIENT','VOLUNTEER','ADMIN','SUPER_ADMIN') NOT NULL,
  `status` enum('ACTIVE','PENDING','INACTIVE','SUSPENDED') DEFAULT 'PENDING',
  `points` int(11) DEFAULT 0,
  `avatar` varchar(255) DEFAULT NULL,
  `selected_badge_id` int(11) DEFAULT NULL,
  `permissions` longtext DEFAULT NULL,
  `ai_subscription_status` enum('FREE','SUBSCRIBER') DEFAULT 'FREE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_points` (`points`),
  KEY `idx_role` (`role`),
  KEY `selected_badge_id` (`selected_badge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: badges
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` enum('INDIVIDUAL_DONOR','CORPORATE_DONOR','RECIPIENT','VOLUNTEER','ADMIN','SUPER_ADMIN') DEFAULT NULL,
  `min_points` int(11) DEFAULT 0,
  `icon` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: addresses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `full_address` text NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `contact_name` varchar(255) NOT NULL,
  `contact_phone` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: food_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `food_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `initial_quantity` int(11) NOT NULL,
  `current_quantity` int(11) NOT NULL,
  `min_quantity` int(11) DEFAULT 1,
  `max_quantity` int(11) NOT NULL,
  `expiry_time` datetime NOT NULL,
  `distribution_start_time` time NOT NULL,
  `distribution_end_time` time NOT NULL,
  `delivery_method` enum('PICKUP','DELIVERY','BOTH') NOT NULL,
  `category` enum('READY_TO_EAT','GROCERIES','BAKERY','FROZEN_FOOD','OTHER') DEFAULT 'OTHER',
  `status` enum('AVAILABLE','RESERVED','CLAIMED','COMPLETED','EXPIRED') DEFAULT 'AVAILABLE',
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `provider_id` (`provider_id`),
  CONSTRAINT `food_items_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: ai_verifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `food_id` int(11) NOT NULL,
  `is_edible` tinyint(1) NOT NULL,
  `halal_score` int(11) NOT NULL,
  `quality_score` int(11) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `ingredients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `allergens` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `food_id` (`food_id`),
  CONSTRAINT `ai_verifications_ibfk_1` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: social_impacts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `social_impacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `food_id` int(11) NOT NULL,
  `total_potential_points` int(11) DEFAULT NULL,
  `co2_per_portion` decimal(8,2) DEFAULT NULL,
  `water_saved_liter` decimal(8,2) DEFAULT NULL,
  `land_saved_sqm` decimal(8,2) DEFAULT NULL,
  `impact_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `food_id` (`food_id`),
  CONSTRAINT `social_impacts_ibfk_1` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: claims
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `claims` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `food_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `volunteer_id` int(11) DEFAULT NULL,
  `address_id` int(11) NOT NULL,
  `claimed_quantity` int(11) NOT NULL,
  `delivery_method` enum('PICKUP','DELIVERY','BOTH') NOT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `unique_code` varchar(255) DEFAULT NULL,
  `is_scanned` tinyint(1) DEFAULT 0,
  `scanned_at` timestamp NULL DEFAULT NULL,
  `scanned_by_id` int(11) DEFAULT NULL,
  `courier_name` varchar(255) DEFAULT NULL,
  `courier_status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `food_id` (`food_id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `volunteer_id` (`volunteer_id`),
  KEY `address_id` (`address_id`),
  CONSTRAINT `claims_ibfk_1` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`),
  CONSTRAINT `claims_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`),
  CONSTRAINT `claims_ibfk_3` FOREIGN KEY (`volunteer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `claims_ibfk_4` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `claim_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `review_media` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `claim_id` (`claim_id`),
  KEY `user_id` (`user_id`),
  KEY `partner_id` (`partner_id`),
  KEY `food_id` (`food_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`claim_id`) REFERENCES `claims` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`partner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: reports
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reporter_id` int(11) NOT NULL,
  `claim_id` int(11) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `evidence_photo` longtext DEFAULT NULL,
  `status` enum('NEW','IN_PROGRESS','RESOLVED','REJECTED') DEFAULT 'NEW',
  `is_urgent` tinyint(1) DEFAULT 0,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reporter_id` (`reporter_id`),
  KEY `claim_id` (`claim_id`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`claim_id`) REFERENCES `claims` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: notifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `linked_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: broadcasts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `broadcasts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `target` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT 'info',
  `author_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `broadcasts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: broadcast_reads
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `broadcast_reads` (
  `user_id` int(11) NOT NULL,
  `broadcast_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`,`broadcast_id`),
  KEY `broadcast_id` (`broadcast_id`),
  CONSTRAINT `broadcast_reads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `broadcast_reads_ibfk_2` FOREIGN KEY (`broadcast_id`) REFERENCES `broadcasts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: food_requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `food_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receiver_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `needed_quantity` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'ACTIVE',
  `posted_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `food_requests_ibfk_1` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: point_histories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `point_histories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `activity_type` varchar(255) NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `point_histories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: user_impact_stats
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_impact_stats` (
  `user_id` int(11) NOT NULL,
  `total_waste_kg` decimal(10,2) DEFAULT 0.00,
  `total_co2_kg` decimal(10,2) DEFAULT 0.00,
  `total_water_liter` decimal(10,2) DEFAULT 0.00,
  `total_land_sqm` decimal(10,2) DEFAULT 0.00,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_impact_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: system_settings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: system_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `actor_id` int(11) DEFAULT 0,
  `actor_name` varchar(255) DEFAULT 'System',
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `severity` enum('info','warning','critical') DEFAULT 'info',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: admin_targets
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_targets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `metric_key` varchar(50) NOT NULL,
  `target_value` decimal(12,2) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `metric_key` (`metric_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: rank_levels
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rank_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` enum('PROVIDER','VOLUNTEER','RECIPIENT') NOT NULL,
  `name` varchar(255) NOT NULL,
  `min_points` int(11) NOT NULL DEFAULT 0,
  `benefits` text DEFAULT NULL,
  `color` varchar(50) DEFAULT 'bg-stone-500',
  `icon` varchar(255) DEFAULT '?',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: quests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `target_value` int(11) NOT NULL,
  `reward_points` int(11) NOT NULL,
  `category` varchar(50) DEFAULT 'DAILY',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: user_quests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_quests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `quest_id` int(11) NOT NULL,
  `current_value` int(11) DEFAULT 0,
  `is_completed` tinyint(1) DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `quest_id` (`quest_id`),
  CONSTRAINT `user_quests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_quests_ibfk_2` FOREIGN KEY (`quest_id`) REFERENCES `quests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: leaderboard_snapshots
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leaderboard_snapshots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `points` int(11) NOT NULL,
  `rank` int(11) NOT NULL,
  `period` varchar(20) NOT NULL,
  `snapshot_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `leaderboard_snapshots_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: faqs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(255) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: user_ai_keys
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_ai_keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `label` varchar(255) DEFAULT 'My AI Key',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_ai_keys_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: corporate_ai_generations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `corporate_ai_generations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `donor_id` int(11) NOT NULL,
  `food_id` int(11) DEFAULT NULL,
  `type` enum('RECIPE','PACKAGING','CSR_COPY','KITCHEN') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `donor_id` (`donor_id`),
  KEY `food_id` (`food_id`),
  CONSTRAINT `corporate_ai_generations_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `corporate_ai_generations_ibfk_2` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: verification_codes
-- Digunakan untuk OTP registrasi dan reset password.
-- identifier: email atau nomor telepon (E.164)
-- channel: 'email' | 'sms' | 'whatsapp'
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `verification_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(255) NOT NULL COMMENT 'email atau nomor telepon E.164',
  `code` varchar(6) NOT NULL,
  `channel` enum('email','sms','whatsapp') NOT NULL DEFAULT 'email',
  `type` enum('REGISTRATION','PASSWORD_RESET') NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_identifier_channel` (`identifier`, `channel`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: email_verifications (legacy - tetap ada untuk kompatibilitas)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Tabel: password_resets (untuk reset password via token)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- Foreign key: users.selected_badge_id -> badges
-- (Ditambahkan terakhir karena badges harus sudah ada)
-- ------------------------------------------------------------
ALTER TABLE `users`
  ADD CONSTRAINT IF NOT EXISTS `users_ibfk_1` 
  FOREIGN KEY (`selected_badge_id`) REFERENCES `badges` (`id`) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- Data default: system_settings
-- ------------------------------------------------------------
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('appName',            'Food AI Rescue'),
('appSlogan',          'Selamatkan Makanan, Selamatkan Bumi'),
('supportPhone',       '628123456789'),
('supportEmail',       'support@foodairescue.id'),
('pointsPerKg',        '100'),
('pointsPerTrx',       '5'),
('co2Multiplier',      '2.5'),
('disableExpiryLogic', 'false'),
('maintenance',        'false'),
('disable_signup',     'false'),
('readonly_mode',      'false'),
('whatsappGateway',    ''),
('whatsappApiKey',     '');

-- ------------------------------------------------------------
-- Data default: admin_targets
-- ------------------------------------------------------------
INSERT IGNORE INTO `admin_targets` (`metric_key`, `target_value`, `label`) VALUES
('waste_kg',       50000.00,  'Target Penyelamatan Pangan'),
('co2_kg',         112500.00, 'Target Pengurangan CO2'),
('beneficiaries',  1000.00,   'Target Jangkauan Penerima');

SET FOREIGN_KEY_CHECKS = 1;
