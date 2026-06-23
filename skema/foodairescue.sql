-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 21 Jun 2026 pada 08.25
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `foodairescue`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `full_address` text NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `contact_name` varchar(255) NOT NULL,
  `contact_phone` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `admin_targets`
--

CREATE TABLE `admin_targets` (
  `id` int(11) NOT NULL,
  `metric_key` varchar(50) NOT NULL,
  `target_value` decimal(12,2) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `ai_verifications`
--

CREATE TABLE `ai_verifications` (
  `id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL,
  `is_edible` tinyint(1) NOT NULL,
  `halal_score` int(11) NOT NULL,
  `quality_score` int(11) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `ingredients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `allergens` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `badges`
--

CREATE TABLE `badges` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('INDIVIDUAL_DONOR','CORPORATE_DONOR','RECIPIENT','VOLUNTEER','ADMIN','SUPER_ADMIN') DEFAULT NULL,
  `min_points` int(11) DEFAULT 0,
  `icon` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `broadcasts`
--

CREATE TABLE `broadcasts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `target` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT 'info',
  `author_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `broadcast_reads`
--

CREATE TABLE `broadcast_reads` (
  `user_id` int(11) NOT NULL,
  `broadcast_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `claims`
--

CREATE TABLE `claims` (
  `id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `volunteer_id` int(11) DEFAULT NULL,
  `address_id` int(11) NOT NULL,
  `claimed_quantity` int(11) NOT NULL,
  `delivery_method` enum('PICKUP','DELIVERY','BOTH') NOT NULL,
  `status` enum('PENDING_APPROVAL','WAITING_PROVIDER','CLAIMED','GET_PROVIDER','PICKUP','PENDING','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING_APPROVAL',
  `unique_code` varchar(255) DEFAULT NULL,
  `pickup_code` varchar(255) DEFAULT NULL,
  `is_scanned` tinyint(1) DEFAULT 0,
  `scanned_at` timestamp NULL DEFAULT NULL,
  `scanned_by_id` int(11) DEFAULT NULL,
  `courier_name` varchar(255) DEFAULT NULL,
  `courier_status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `corporate_ai_generations`
--

CREATE TABLE `corporate_ai_generations` (
  `id` int(11) NOT NULL,
  `donor_id` int(11) NOT NULL,
  `food_id` int(11) DEFAULT NULL,
  `type` enum('RECIPE','PACKAGING','CSR_COPY','KITCHEN') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `email_verifications`
--

CREATE TABLE `email_verifications` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `faqs`
--

CREATE TABLE `faqs` (
  `id` int(11) NOT NULL,
  `category` varchar(255) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `food_items`
--

CREATE TABLE `food_items` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `food_requests`
--

CREATE TABLE `food_requests` (
  `id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `needed_quantity` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'ACTIVE',
  `posted_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `leaderboard_snapshots`
--

CREATE TABLE `leaderboard_snapshots` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `points` int(11) NOT NULL,
  `rank` int(11) NOT NULL,
  `period` varchar(20) NOT NULL,
  `snapshot_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `linked_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `point_histories`
--

CREATE TABLE `point_histories` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `activity_type` varchar(255) NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `quests`
--

CREATE TABLE `quests` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `target_value` int(11) NOT NULL,
  `reward_points` int(11) NOT NULL,
  `category` varchar(50) DEFAULT 'DAILY',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `rank_levels`
--

CREATE TABLE `rank_levels` (
  `id` int(11) NOT NULL,
  `role` enum('PROVIDER','VOLUNTEER','RECIPIENT') NOT NULL,
  `name` varchar(255) NOT NULL,
  `min_points` int(11) NOT NULL DEFAULT 0,
  `benefits` text DEFAULT NULL,
  `color` varchar(50) DEFAULT 'bg-stone-500',
  `icon` varchar(255) DEFAULT '?',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `claim_id` int(11) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `evidence_photo` longtext DEFAULT NULL,
  `status` enum('NEW','IN_PROGRESS','RESOLVED','REJECTED') DEFAULT 'NEW',
  `is_urgent` tinyint(1) DEFAULT 0,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `claim_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `review_media` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `social_impacts`
--

CREATE TABLE `social_impacts` (
  `id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL,
  `total_potential_points` int(11) DEFAULT NULL,
  `co2_per_portion` decimal(8,2) DEFAULT NULL,
  `water_saved_liter` decimal(8,2) DEFAULT NULL,
  `land_saved_sqm` decimal(8,2) DEFAULT NULL,
  `impact_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `actor_id` int(11) DEFAULT 0,
  `actor_name` varchar(255) DEFAULT 'System',
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `severity` enum('info','warning','critical') DEFAULT 'info',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
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
  `last_login_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_ai_keys`
--

CREATE TABLE `user_ai_keys` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `label` varchar(255) DEFAULT 'My AI Key',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_impact_stats`
--

CREATE TABLE `user_impact_stats` (
  `user_id` int(11) NOT NULL,
  `total_waste_kg` decimal(10,2) DEFAULT 0.00,
  `total_co2_kg` decimal(10,2) DEFAULT 0.00,
  `total_water_liter` decimal(10,2) DEFAULT 0.00,
  `total_land_sqm` decimal(10,2) DEFAULT 0.00,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_quests`
--

CREATE TABLE `user_quests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quest_id` int(11) NOT NULL,
  `current_value` int(11) DEFAULT 0,
  `is_completed` tinyint(1) DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `verification_codes`
--

CREATE TABLE `verification_codes` (
  `id` int(11) NOT NULL,
  `identifier` varchar(255) NOT NULL COMMENT 'email atau nomor telepon E.164',
  `code` varchar(6) NOT NULL,
  `channel` enum('email','sms','whatsapp') NOT NULL DEFAULT 'email',
  `type` enum('REGISTRATION','PASSWORD_RESET') NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_badges`
--

CREATE TABLE `user_badges` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `badge_id` int(11) NOT NULL,
  `awarded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `admin_targets`
--
ALTER TABLE `admin_targets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `metric_key` (`metric_key`);

--
-- Indeks untuk tabel `ai_verifications`
--
ALTER TABLE `ai_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `food_id` (`food_id`);

--
-- Indeks untuk tabel `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `broadcasts`
--
ALTER TABLE `broadcasts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author_id` (`author_id`);

--
-- Indeks untuk tabel `broadcast_reads`
--
ALTER TABLE `broadcast_reads`
  ADD PRIMARY KEY (`user_id`,`broadcast_id`),
  ADD KEY `broadcast_id` (`broadcast_id`);

--
-- Indeks untuk tabel `claims`
--
ALTER TABLE `claims`
  ADD PRIMARY KEY (`id`),
  ADD KEY `food_id` (`food_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `volunteer_id` (`volunteer_id`),
  ADD KEY `address_id` (`address_id`);

--
-- Indeks untuk tabel `corporate_ai_generations`
--
ALTER TABLE `corporate_ai_generations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `donor_id` (`donor_id`),
  ADD KEY `food_id` (`food_id`);

--
-- Indeks untuk tabel `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email` (`email`);

--
-- Indeks untuk tabel `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `food_items`
--
ALTER TABLE `food_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indeks untuk tabel `food_requests`
--
ALTER TABLE `food_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indeks untuk tabel `leaderboard_snapshots`
--
ALTER TABLE `leaderboard_snapshots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `point_histories`
--
ALTER TABLE `point_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `quests`
--
ALTER TABLE `quests`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `rank_levels`
--
ALTER TABLE `rank_levels`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reporter_id` (`reporter_id`),
  ADD KEY `claim_id` (`claim_id`);

--
-- Indeks untuk tabel `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `claim_id` (`claim_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `partner_id` (`partner_id`),
  ADD KEY `food_id` (`food_id`);

--
-- Indeks untuk tabel `social_impacts`
--
ALTER TABLE `social_impacts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `food_id` (`food_id`);

--
-- Indeks untuk tabel `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_points` (`points`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `selected_badge_id` (`selected_badge_id`);

--
-- Indeks untuk tabel `user_ai_keys`
--
ALTER TABLE `user_ai_keys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

-- Indeks untuk tabel `user_impact_stats`
--
ALTER TABLE `user_impact_stats`
  ADD PRIMARY KEY (`user_id`);

--
-- Indeks untuk tabel `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `badge_id` (`badge_id`);

--
-- Indeks untuk tabel `user_quests`
--
ALTER TABLE `user_quests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `quest_id` (`quest_id`);

--
-- Indeks untuk tabel `verification_codes`
--
ALTER TABLE `verification_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_identifier_channel` (`identifier`,`channel`,`type`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `admin_targets`
--
ALTER TABLE `admin_targets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `ai_verifications`
--
ALTER TABLE `ai_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `badges`
--
ALTER TABLE `badges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `broadcasts`
--
ALTER TABLE `broadcasts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `claims`
--
ALTER TABLE `claims`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `corporate_ai_generations`
--
ALTER TABLE `corporate_ai_generations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `food_items`
--
ALTER TABLE `food_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `food_requests`
--
ALTER TABLE `food_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `leaderboard_snapshots`
--
ALTER TABLE `leaderboard_snapshots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `point_histories`
--
ALTER TABLE `point_histories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `quests`
--
ALTER TABLE `quests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `rank_levels`
--
ALTER TABLE `rank_levels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `social_impacts`
--
ALTER TABLE `social_impacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `user_ai_keys`
--
ALTER TABLE `user_ai_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `user_quests`
--
ALTER TABLE `user_quests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `verification_codes`
--
ALTER TABLE `verification_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `ai_verifications`
--
ALTER TABLE `ai_verifications`
  ADD CONSTRAINT `ai_verifications_ibfk_1` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `broadcasts`
--
ALTER TABLE `broadcasts`
  ADD CONSTRAINT `broadcasts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `broadcast_reads`
--
ALTER TABLE `broadcast_reads`
  ADD CONSTRAINT `broadcast_reads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `broadcast_reads_ibfk_2` FOREIGN KEY (`broadcast_id`) REFERENCES `broadcasts` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `claims`
--
ALTER TABLE `claims`
  ADD CONSTRAINT `claims_ibfk_1` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`),
  ADD CONSTRAINT `claims_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `claims_ibfk_3` FOREIGN KEY (`volunteer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `claims_ibfk_4` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`);

--
-- Ketidakleluasaan untuk tabel `corporate_ai_generations`
--
ALTER TABLE `corporate_ai_generations`
  ADD CONSTRAINT `corporate_ai_generations_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `corporate_ai_generations_ibfk_2` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `food_items`
--
ALTER TABLE `food_items`
  ADD CONSTRAINT `food_items_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `food_requests`
--
ALTER TABLE `food_requests`
  ADD CONSTRAINT `food_requests_ibfk_1` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `leaderboard_snapshots`
--
ALTER TABLE `leaderboard_snapshots`
  ADD CONSTRAINT `leaderboard_snapshots_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `point_histories`
--
ALTER TABLE `point_histories`
  ADD CONSTRAINT `point_histories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`claim_id`) REFERENCES `claims` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`claim_id`) REFERENCES `claims` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`partner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `social_impacts`
--
ALTER TABLE `social_impacts`
  ADD CONSTRAINT `social_impacts_ibfk_1` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`selected_badge_id`) REFERENCES `badges` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `user_ai_keys`
--
ALTER TABLE `user_ai_keys`
  ADD CONSTRAINT `user_ai_keys_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_impact_stats`
--
ALTER TABLE `user_impact_stats`
  ADD CONSTRAINT `user_impact_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_quests`
--
ALTER TABLE `user_quests`
  ADD CONSTRAINT `user_quests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_quests_ibfk_2` FOREIGN KEY (`quest_id`) REFERENCES `quests` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
