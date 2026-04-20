-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 20 Apr 2026 pada 17.52
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

--
-- Dumping data untuk tabel `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `label`, `full_address`, `latitude`, `longitude`, `contact_name`, `contact_phone`, `is_primary`, `created_at`) VALUES
(2, 12, 'Donatur Cihuy', '1, Jalan Belakang Monumen Telkom, Sukapura, Dayeuhkolot, Kabupaten Bandung, Jawa Barat, Jawa, 40257, Indonesia', -6.97305510, 107.63289610, 'Nanat', '085215376975', 1, '2026-04-14 14:33:24'),
(3, 13, 'Penerima1', 'Sukapura, Dayeuhkolot, Kabupaten Bandung, Jawa Barat, Jawa, 40288, Indonesia', -6.97849560, 107.63338160, 'penerima1', '085215376975', 1, '2026-03-13 00:05:22');

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

--
-- Dumping data untuk tabel `admin_targets`
--

INSERT INTO `admin_targets` (`id`, `metric_key`, `target_value`, `label`, `updated_at`) VALUES
(1, 'waste_kg', 50000.00, 'Target Penyelamatan Pangan', '2026-04-09 16:08:48'),
(2, 'co2_kg', 112500.00, 'Target Pengurangan CO2', '2026-04-09 16:08:48'),
(3, 'beneficiaries', 1000.00, 'Target Jangkauan Penerima', '2026-04-09 16:08:48');

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
  `ingredients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ingredients`)),
  `allergens` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ai_verifications`
--

INSERT INTO `ai_verifications` (`id`, `food_id`, `is_edible`, `halal_score`, `quality_score`, `reason`, `ingredients`, `allergens`) VALUES
(1, 1, 1, 80, 80, 'Gagal menghubungi AI Server. Menggunakan estimasi standar.', '[\"Burger MCD\"]', NULL),
(2, 2, 1, 95, 95, 'Selisih waktu antara masak dan distribusi adalah 1 jam 26 menit, masih dalam batas aman Golden Rule (maksimal 4 jam). Produk konsisten antara data teks dan visual (burger dengan patty daging, keju, dan bun). Risiko mikrobiologi rendah karena distribusi dimulai segera setelah matang.', '[\"Daging burger\",\"Bun/Roti Burger\",\"Keju\",\"Acar/Pickles\"]', NULL),
(3, 3, 1, 85, 92, 'Audit kepatuhan menunjukkan selisih waktu masak dan distribusi adalah 1 jam 22 menit, jauh di bawah ambang batas risiko 4 jam. Secara visual produk adalah burger sapi dengan keju. Status halal tinggi karena tidak ditemukan bahan haram eksplisit, namun memerlukan verifikasi sertifikasi penyembelihan daging.', '[\"Daging Sapi\",\"Roti Bun\",\"Keju\",\"Acar\"]', NULL);

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

--
-- Dumping data untuk tabel `broadcasts`
--

INSERT INTO `broadcasts` (`id`, `title`, `content`, `target`, `type`, `author_id`, `created_at`) VALUES
(1, 'test semua', 'asdfgh', 'all', 'info', 9, '2026-04-14 11:56:56');

-- --------------------------------------------------------

--
-- Struktur dari tabel `broadcast_reads`
--

CREATE TABLE `broadcast_reads` (
  `user_id` int(11) NOT NULL,
  `broadcast_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `broadcast_reads`
--

INSERT INTO `broadcast_reads` (`user_id`, `broadcast_id`, `read_at`) VALUES
(10, 1, '2026-04-20 10:35:43'),
(12, 1, '2026-04-20 10:41:13'),
(13, 1, '2026-04-20 13:14:02');

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
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `unique_code` varchar(255) DEFAULT NULL,
  `is_scanned` tinyint(1) DEFAULT 0,
  `scanned_at` timestamp NULL DEFAULT NULL,
  `scanned_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `courier_name` varchar(255) DEFAULT NULL,
  `courier_status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `claims`
--

INSERT INTO `claims` (`id`, `food_id`, `receiver_id`, `volunteer_id`, `address_id`, `claimed_quantity`, `delivery_method`, `status`, `unique_code`, `is_scanned`, `scanned_at`, `scanned_by_id`, `created_at`, `completed_at`, `courier_name`, `courier_status`) VALUES
(1, 3, 13, 14, 3, 5, 'DELIVERY', 'IN_PROGRESS', 'FAR-3544', 0, NULL, NULL, '2026-03-13 00:06:31', NULL, 'relawan1', 'picking_up'),
(2, 2, 13, NULL, 3, 5, 'DELIVERY', 'PENDING', 'FAR-2567', 0, NULL, NULL, '2026-03-13 00:07:15', NULL, NULL, NULL);

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

--
-- Dumping data untuk tabel `food_items`
--

INSERT INTO `food_items` (`id`, `provider_id`, `name`, `description`, `initial_quantity`, `current_quantity`, `min_quantity`, `max_quantity`, `expiry_time`, `distribution_start_time`, `distribution_end_time`, `delivery_method`, `category`, `status`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 12, 'Burger MCD', 'Gagal menghubungi AI Server. Menggunakan estimasi standar.', 100, 100, 1, 5, '2026-04-14 16:00:00', '22:30:00', '23:00:00', 'PICKUP', 'OTHER', 'EXPIRED', 'http://localhost:5000/assets/inventory/food_1776177350132.jpg', '2026-04-14 14:35:50', '2026-04-15 03:59:29'),
(2, 12, 'Burger', 'Selisih waktu antara masak dan distribusi adalah 1 jam 26 menit, masih dalam batas aman Golden Rule (maksimal 4 jam). Produk konsisten antara data teks dan visual (burger dengan patty daging, keju, dan bun). Risiko mikrobiologi rendah karena distribusi dimulai segera setelah matang.', 100, 95, 1, 5, '2026-04-14 14:00:00', '18:30:00', '21:00:00', 'BOTH', 'OTHER', 'EXPIRED', 'http://localhost:5000/assets/inventory/food_1776179268628.jpg', '2026-04-14 15:07:48', '2026-04-15 03:59:29'),
(3, 12, 'Burger', 'Audit kepatuhan menunjukkan selisih waktu masak dan distribusi adalah 1 jam 22 menit, jauh di bawah ambang batas risiko 4 jam. Secara visual produk adalah burger sapi dengan keju. Status halal tinggi karena tidak ditemukan bahan haram eksplisit, namun memerlukan verifikasi sertifikasi penyembelihan daging.', 10, 5, 1, 5, '2026-04-14 16:00:00', '22:30:00', '23:00:00', 'BOTH', 'OTHER', 'EXPIRED', 'http://localhost:5000/assets/inventory/food_1776179378723.jpg', '2026-04-14 15:09:38', '2026-04-15 03:59:29');

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

--
-- Dumping data untuk tabel `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `linked_id`, `is_read`, `created_at`) VALUES
(1, 12, 'warning', 'Pesanan Masuk!', 'Seseorang baru saja mengklaim menu \"Burger\". Mohon segera siapkan.', 1, 1, '2026-03-13 00:06:31'),
(2, 13, 'success', 'Klaim Berhasil', 'Klaim untuk \"Burger\" sedang diproses. Simpan kode Anda: FAR-3544', 1, 1, '2026-03-13 00:06:31'),
(3, 12, 'warning', 'Pesanan Masuk!', 'Seseorang baru saja mengklaim menu \"Burger\". Mohon segera siapkan.', 2, 1, '2026-03-13 00:07:15'),
(4, 13, 'success', 'Klaim Berhasil', 'Klaim untuk \"Burger\" sedang diproses. Simpan kode Anda: FAR-2567', 2, 1, '2026-03-13 00:07:15'),
(5, 13, 'info', 'Kurir Sedang Menuju Lokasi', 'Relawan sedang menjemput donasi \"Burger\" untuk diantar ke Anda.', 1, 1, '2026-03-13 00:09:19'),
(6, 14, 'info', 'Tugas Baru Diterima', 'Anda telah ditugaskan untuk mengantar \"Burger\". Cek menu Misi Aktif!', 1, 0, '2026-04-14 16:09:47'),
(7, 13, 'info', 'Relawan Ditemukan', 'Relawan relawan1 akan mengantar pesanan \"Burger\" Anda.', 1, 1, '2026-04-14 16:09:47');

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

--
-- Dumping data untuk tabel `rank_levels`
--

INSERT INTO `rank_levels` (`id`, `role`, `name`, `min_points`, `benefits`, `color`, `icon`, `created_at`) VALUES
(12, 'VOLUNTEER', 'asdfghj', 5, '[]', 'bg-stone-500', '🌱', '2026-04-14 16:10:22');

-- --------------------------------------------------------

--
-- Struktur dari tabel `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `claim_id` int(11) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `evidence_photo` longtext DEFAULT NULL,
  `status` enum('NEW','IN_PROGRESS','RESOLVED','REJECTED') DEFAULT 'NEW',
  `is_urgent` tinyint(1) DEFAULT 0,
  `title` varchar(255) DEFAULT NULL,
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
  `review_media` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`review_media`)),
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
  `impact_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`impact_details`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `social_impacts`
--

INSERT INTO `social_impacts` (`id`, `food_id`, `total_potential_points`, `co2_per_portion`, `water_saved_liter`, `land_saved_sqm`, `impact_details`) VALUES
(1, 1, 200000, 24.00, 0.00, 0.00, '{\"co2Breakdown\":[{\"name\":\"Burger MCD\",\"weightKg\":20,\"factor\":1.2,\"result\":24,\"category\":\"Lainnya\"}],\"socialBreakdown\":[{\"name\":\"Burger MCD\",\"weightKg\":20,\"factor\":1,\"result\":20,\"category\":\"Lainnya\"}],\"portionCount\":100,\"co2PerPortion\":24,\"pointsPerPortion\":2000,\"wasteReduction\":2000,\"level\":\"Aktif\"}'),
(2, 2, 335000, 102.00, 0.00, 0.00, '{\"co2Breakdown\":[{\"name\":\"Daging burger\",\"weightKg\":5,\"factor\":18,\"result\":90,\"category\":\"Daging Merah\"},{\"name\":\"Bun/Roti Burger\",\"weightKg\":5,\"factor\":0.8,\"result\":4,\"category\":\"Karbohidrat\"},{\"name\":\"Keju\",\"weightKg\":5,\"factor\":1.2,\"result\":6,\"category\":\"Lainnya\"},{\"name\":\"Acar/Pickles\",\"weightKg\":5,\"factor\":0.4,\"result\":2,\"category\":\"Sayur & Buah\"}],\"socialBreakdown\":[{\"name\":\"Daging burger\",\"weightKg\":5,\"factor\":3,\"result\":15,\"category\":\"Daging Merah\"},{\"name\":\"Bun/Roti Burger\",\"weightKg\":5,\"factor\":1.5,\"result\":7.5,\"category\":\"Karbohidrat\"},{\"name\":\"Keju\",\"weightKg\":5,\"factor\":1,\"result\":5,\"category\":\"Lainnya\"},{\"name\":\"Acar/Pickles\",\"weightKg\":5,\"factor\":1.2,\"result\":6,\"category\":\"Sayur & Buah\"}],\"portionCount\":100,\"co2PerPortion\":102,\"pointsPerPortion\":3350,\"wasteReduction\":2000,\"level\":\"Aktif\"}'),
(3, 3, 3350, 10.20, 0.00, 0.00, '{\"co2Breakdown\":[{\"name\":\"Daging Sapi\",\"weightKg\":0.5,\"factor\":18,\"result\":9,\"category\":\"Daging Merah\"},{\"name\":\"Roti Bun\",\"weightKg\":0.5,\"factor\":0.8,\"result\":0.4,\"category\":\"Karbohidrat\"},{\"name\":\"Keju\",\"weightKg\":0.5,\"factor\":1.2,\"result\":0.6,\"category\":\"Lainnya\"},{\"name\":\"Acar\",\"weightKg\":0.5,\"factor\":0.4,\"result\":0.2,\"category\":\"Sayur & Buah\"}],\"socialBreakdown\":[{\"name\":\"Daging Sapi\",\"weightKg\":0.5,\"factor\":3,\"result\":1.5,\"category\":\"Daging Merah\"},{\"name\":\"Roti Bun\",\"weightKg\":0.5,\"factor\":1.5,\"result\":0.75,\"category\":\"Karbohidrat\"},{\"name\":\"Keju\",\"weightKg\":0.5,\"factor\":1,\"result\":0.5,\"category\":\"Lainnya\"},{\"name\":\"Acar\",\"weightKg\":0.5,\"factor\":1.2,\"result\":0.6,\"category\":\"Sayur & Buah\"}],\"portionCount\":10,\"co2PerPortion\":10.2,\"pointsPerPortion\":335,\"wasteReduction\":20,\"level\":\"Aktif\"}');

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

--
-- Dumping data untuk tabel `system_logs`
--

INSERT INTO `system_logs` (`id`, `actor_id`, `actor_name`, `action`, `details`, `severity`, `created_at`) VALUES
(1, 9, 'Shafnat Admin', 'Send Broadcast', 'Kirim pengumuman: test semua (Target: all)', 'info', '2026-04-14 11:56:56'),
(2, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-14 14:31:32'),
(3, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: Donatur Individu 1', 'info', '2026-03-13 00:07:31'),
(4, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: Donatur Individu 1', 'info', '2026-03-13 00:07:39'),
(5, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-03-13 00:07:51'),
(6, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-03-13 00:09:30'),
(7, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-14 16:07:22'),
(8, 9, 'Shafnat Admin', 'Assign Volunteer', 'Tugaskan relawan1 ke Klaim #1', 'info', '2026-04-14 16:09:47'),
(9, 0, 'System', 'Upsert Rank Level', 'Simpan Level: asdfghj (PROVIDER)', 'info', '2026-04-14 16:10:22'),
(10, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-15 01:56:13'),
(11, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-15 03:45:26'),
(12, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-15 08:20:09'),
(13, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-15 13:50:31'),
(14, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-03-13 00:04:14'),
(15, 0, 'System', 'Upsert Rank Level', 'Simpan Level: asdfghj (VOLUNTEER)', 'info', '2026-04-16 14:19:36'),
(16, 0, 'System', 'Upsert Rank Level', 'Simpan Level: asdfghj (PROVIDER)', 'info', '2026-04-16 14:19:37'),
(17, 0, 'System', 'Upsert Rank Level', 'Simpan Level: asdfghj (VOLUNTEER)', 'info', '2026-04-16 14:20:09'),
(18, 0, 'System', 'Upsert Rank Level', 'Simpan Level: asdfghj (RECIPIENT)', 'info', '2026-04-16 14:20:14'),
(19, 0, 'System', 'Upsert Rank Level', 'Simpan Level: asdfghj (VOLUNTEER)', 'info', '2026-04-16 14:20:41'),
(20, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-16 14:53:04'),
(21, 9, 'Shafnat Admin', 'Update Settings', 'Ubah pengaturan sistem: maintenance, disable_signup, readonly_mode, appName, appSlogan, supportPhone, supportEmail, pointsPerKg, pointsPerTrx, co2Multiplier, whatsappGateway, whatsappApiKey, disableExpiryLogic', 'info', '2026-04-20 07:10:23'),
(22, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: Donatur Individu 1', 'info', '2026-04-20 10:34:06'),
(23, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-20 10:41:10'),
(24, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-20 10:46:08'),
(25, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-20 10:46:23'),
(26, 9, 'Shafnat Admin', 'Update Settings', 'Ubah pengaturan sistem: maintenance, disable_signup, readonly_mode, appName, appSlogan, supportPhone, supportEmail, pointsPerKg, pointsPerTrx, co2Multiplier, whatsappGateway, whatsappApiKey, disableExpiryLogic', 'info', '2026-04-20 13:01:37'),
(27, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-20 13:01:49'),
(28, 0, 'Admin', 'Activate User', 'ACC/Aktivasi Akun: donaturkorporat2', 'info', '2026-04-20 15:04:37');

-- --------------------------------------------------------

--
-- Struktur dari tabel `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `system_settings`
--

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES
('appName', 'Food AI Rescue', '2026-04-20 07:10:23'),
('appSlogan', 'Selamatkan Makanan, Selamatkan Bumi', '2026-04-20 07:10:23'),
('co2Multiplier', '2.5', '2026-04-20 07:10:23'),
('disableExpiryLogic', 'true', '2026-04-20 13:01:37'),
('disable_signup', 'false', '2026-04-20 06:20:04'),
('maintenance', 'false', '2026-04-20 06:20:04'),
('pointsPerKg', '100', '2026-04-20 13:01:37'),
('pointsPerTrx', '5', '2026-04-20 07:10:23'),
('readonly_mode', 'false', '2026-04-20 06:20:04'),
('supportEmail', 'support@foodairescue.id', '2026-04-20 13:01:37'),
('supportPhone', '628123456789', '2026-04-20 13:01:37'),
('whatsappApiKey', '', '2026-04-20 07:10:23'),
('whatsappGateway', '', '2026-04-20 07:10:23');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `permissions` longtext DEFAULT NULL,
  `ai_subscription_status` enum('FREE','SUBSCRIBER') DEFAULT 'FREE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `status`, `points`, `avatar`, `selected_badge_id`, `created_at`, `updated_at`, `permissions`, `ai_subscription_status`) VALUES
(7, 'testkorp', 'testkorp@gmail.com', '$2b$10$Ad7nri9aFVRRJFCwjDq6F.EyTq/UlpwrR.burUDoIh4SfalW6ghMC', '85215376975', 'CORPORATE_DONOR', 'ACTIVE', 0, NULL, NULL, '2026-04-14 11:38:29', '2026-04-14 14:21:31', NULL, 'FREE'),
(8, 'Master Admin', 'superadmin@foodairescue.com', '$2b$10$nJq4/xEPsQikvy6Zby49X.NhFyfdIRQjMsSoe4WSv24sQxljxI7vK', NULL, 'SUPER_ADMIN', 'ACTIVE', 0, NULL, NULL, '2026-04-14 11:42:28', '2026-04-14 11:49:24', '[\"all\"]', 'FREE'),
(9, 'Shafnat Admin', 'superadmin@gmail.com', '$2b$10$rMo1xMzGYiTNgqVOIXzLDedyYmx3/1zJnjF/PaEboVXnBa8uLnIzi', '85215376975', 'SUPER_ADMIN', 'ACTIVE', 0, NULL, NULL, '2026-04-14 11:44:31', '2026-04-14 11:44:52', NULL, 'FREE'),
(10, 'Donatur Individu 1', 'donaturindividu1@gmail.com', '$2b$10$3mLsCUPwuOKrDGb.FP2AHu3z0nf/qzuqoFXyeHoqoRyfF0z6dlZsi', '85215376975', 'INDIVIDUAL_DONOR', 'ACTIVE', 0, 'https://ui-avatars.com/api/?name=Donatur%20Individu%201&background=random', NULL, '2026-04-14 12:56:22', '2026-04-14 12:58:02', NULL, 'FREE'),
(11, 'donaturkorporat1', 'donaturkorporat1@gmail.com', '$2b$10$vamgvXz3CoEapXIeOmnt/uJS4HaVyWrRNwdUGtPsdDypi9jb7IrfO', '85215376975', 'CORPORATE_DONOR', 'ACTIVE', 0, NULL, NULL, '2026-04-14 14:13:58', '2026-04-14 14:25:06', NULL, 'FREE'),
(12, 'donaturkorporat2', 'donaturkorporat2@gmail.com', '$2b$10$tdTSL8/FYFZhA4tXCWxCfuOFsdxs9kI9tEeJkYUUb/wfr9WJ1t1Fy', '85215376975', 'CORPORATE_DONOR', 'ACTIVE', 0, 'https://ui-avatars.com/api/?name=donaturkorporat2&background=random', NULL, '2026-04-14 14:24:46', '2026-04-14 14:31:32', NULL, 'FREE'),
(13, 'penerima1', 'penerima1@gmail.com', '$2b$10$GFGJ9TbIzlGTPVMZIjTZaerO.ELGLH53Zb3kWMHYhm3rNDwoLpb92', '85215376975', 'RECIPIENT', 'ACTIVE', 0, NULL, NULL, '2026-03-13 00:04:10', '2026-03-13 00:04:28', NULL, 'FREE'),
(14, 'relawan1', 'relawan1@gmail.com', '$2b$10$NYE457LloRZKKrWmGejY5e7eA1Espe6WSme65yujzduzhdujXhfmO', '85215376975', 'VOLUNTEER', 'ACTIVE', 0, NULL, NULL, '2026-03-13 00:08:56', '2026-03-13 00:09:10', NULL, 'FREE');

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
  `email` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `type` enum('REGISTRATION','PASSWORD_RESET') NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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

--
-- Indeks untuk tabel `user_impact_stats`
--
ALTER TABLE `user_impact_stats`
  ADD PRIMARY KEY (`user_id`);

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
  ADD KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `admin_targets`
--
ALTER TABLE `admin_targets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `ai_verifications`
--
ALTER TABLE `ai_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `badges`
--
ALTER TABLE `badges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `broadcasts`
--
ALTER TABLE `broadcasts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `claims`
--
ALTER TABLE `claims`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `corporate_ai_generations`
--
ALTER TABLE `corporate_ai_generations`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `user_ai_keys`
--
ALTER TABLE `user_ai_keys`
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
