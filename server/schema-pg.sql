-- ============================================================
-- Food AI Rescue - Database Schema
-- Satu file SQL lengkap untuk semua tabel
-- Dibuat otomatis oleh setupDatabase.js saat server pertama kali dijalankan
-- ============================================================




-- ------------------------------------------------------------
-- Tabel: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  phone varchar(255) DEFAULT NULL,
  role VARCHAR(255) NOT NULL,
  status VARCHAR(255) DEFAULT 'PENDING',
  points INTEGER DEFAULT 0,
  avatar varchar(255) DEFAULT NULL,
  selected_badge_id INTEGER DEFAULT NULL,
  permissions TEXT DEFAULT NULL,
  ai_subscription_status VARCHAR(255) DEFAULT 'FREE',
  last_login_at timestamp NULL DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (id),
  UNIQUE (email)
);

-- ------------------------------------------------------------
-- Tabel: badges
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL,
  name varchar(255) NOT NULL,
  role VARCHAR(255) DEFAULT NULL,
  min_points INTEGER DEFAULT 0,
  icon varchar(255) DEFAULT NULL,
  description text DEFAULT NULL,
  image text DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabel: addresses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL,
  user_id INTEGER NOT NULL,
  label varchar(255) NOT NULL,
  full_address text NOT NULL,
  latitude decimal(10,8) NOT NULL,
  longitude decimal(11,8) NOT NULL,
  contact_name varchar(255) NOT NULL,
  contact_phone varchar(255) NOT NULL,
  is_primary SMALLINT DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT addresses_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: food_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_items (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  address_id INTEGER DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  description text DEFAULT NULL,
  initial_quantity INTEGER NOT NULL,
  current_quantity INTEGER NOT NULL,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER NOT NULL,
  expiry_time TIMESTAMP NOT NULL,
  distribution_start_time time NOT NULL,
  distribution_end_time time NOT NULL,
  delivery_method VARCHAR(255) NOT NULL,
  category VARCHAR(255) DEFAULT 'OTHER',
  status VARCHAR(255) DEFAULT 'AVAILABLE',
  image_url varchar(255) DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT food_items_ibfk_1 FOREIGN KEY (provider_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT food_items_ibfk_2 FOREIGN KEY (address_id) REFERENCES addresses (id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Tabel: ai_verifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_verifications (
  id SERIAL,
  food_id INTEGER NOT NULL,
  is_edible SMALLINT NOT NULL,
  halal_score INTEGER NOT NULL,
  quality_score INTEGER DEFAULT NULL,
  reason text DEFAULT NULL,
  ingredients TEXT DEFAULT NULL,
  allergens text DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE (food_id),
  CONSTRAINT ai_verifications_ibfk_1 FOREIGN KEY (food_id) REFERENCES food_items (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: social_impacts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_impacts (
  id SERIAL,
  food_id INTEGER NOT NULL,
  total_potential_points INTEGER DEFAULT NULL,
  co2_per_portion decimal(8,2) DEFAULT NULL,
  water_saved_liter decimal(8,2) DEFAULT NULL,
  land_saved_sqm decimal(8,2) DEFAULT NULL,
  impact_details TEXT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE (food_id),
  CONSTRAINT social_impacts_ibfk_1 FOREIGN KEY (food_id) REFERENCES food_items (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: claims
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS claims (
  id SERIAL,
  food_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  volunteer_id INTEGER DEFAULT NULL,
  address_id INTEGER NOT NULL,
  claimed_quantity INTEGER NOT NULL,
  delivery_method VARCHAR(255) NOT NULL,
  status VARCHAR(255) DEFAULT 'PENDING_APPROVAL',
  unique_code varchar(255) DEFAULT NULL,
  pickup_code varchar(255) DEFAULT NULL,
  is_scanned SMALLINT DEFAULT 0,
  scanned_at timestamp NULL DEFAULT NULL,
  scanned_by_id INTEGER DEFAULT NULL,
  courier_name varchar(255) DEFAULT NULL,
  courier_status varchar(50) DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT claims_ibfk_1 FOREIGN KEY (food_id) REFERENCES food_items (id),
  CONSTRAINT claims_ibfk_2 FOREIGN KEY (receiver_id) REFERENCES users (id),
  CONSTRAINT claims_ibfk_3 FOREIGN KEY (volunteer_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT claims_ibfk_4 FOREIGN KEY (address_id) REFERENCES addresses (id)
);

-- ------------------------------------------------------------
-- Tabel: reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL,
  claim_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  partner_id INTEGER NOT NULL,
  food_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment text DEFAULT NULL,
  review_media TEXT DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (claim_id),
  CONSTRAINT reviews_ibfk_1 FOREIGN KEY (claim_id) REFERENCES claims (id) ON DELETE CASCADE,
  CONSTRAINT reviews_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT reviews_ibfk_3 FOREIGN KEY (partner_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT reviews_ibfk_4 FOREIGN KEY (food_id) REFERENCES food_items (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: reports
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL,
  reporter_id INTEGER NOT NULL,
  claim_id INTEGER NOT NULL,
  category varchar(255) DEFAULT NULL,
  title varchar(255) DEFAULT NULL,
  description text DEFAULT NULL,
  evidence_photo TEXT DEFAULT NULL,
  status VARCHAR(255) DEFAULT 'NEW',
  is_urgent SMALLINT DEFAULT 0,
  admin_notes text DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT reports_ibfk_1 FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT reports_ibfk_2 FOREIGN KEY (claim_id) REFERENCES claims (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: notifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL,
  user_id INTEGER NOT NULL,
  type varchar(255) NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  linked_id INTEGER DEFAULT NULL,
  is_read SMALLINT DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT notifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: broadcasts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS broadcasts (
  id SERIAL,
  title varchar(255) NOT NULL,
  content text NOT NULL,
  target varchar(255) NOT NULL,
  type varchar(255) DEFAULT 'info',
  author_id INTEGER DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT broadcasts_ibfk_1 FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Tabel: broadcast_reads
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS broadcast_reads (
  user_id INTEGER NOT NULL,
  broadcast_id INTEGER NOT NULL,
  read_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id,broadcast_id),
  CONSTRAINT broadcast_reads_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT broadcast_reads_ibfk_2 FOREIGN KEY (broadcast_id) REFERENCES broadcasts (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: food_requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_requests (
  id SERIAL,
  receiver_id INTEGER NOT NULL,
  title varchar(255) NOT NULL,
  description text DEFAULT NULL,
  needed_quantity INTEGER DEFAULT NULL,
  status varchar(255) DEFAULT 'ACTIVE',
  posted_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT food_requests_ibfk_1 FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: point_histories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS point_histories (
  id SERIAL,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  activity_type varchar(255) NOT NULL,
  reference_id INTEGER DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT point_histories_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: user_impact_stats
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_impact_stats (
  user_id INTEGER NOT NULL,
  total_waste_kg decimal(10,2) DEFAULT 0.00,
  total_co2_kg decimal(10,2) DEFAULT 0.00,
  total_water_liter decimal(10,2) DEFAULT 0.00,
  total_land_sqm decimal(10,2) DEFAULT 0.00,
  last_updated timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (user_id),
  CONSTRAINT user_impact_stats_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: system_settings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key varchar(50) NOT NULL,
  setting_value text DEFAULT NULL,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (setting_key)
);

-- ------------------------------------------------------------
-- Tabel: system_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL,
  actor_id INTEGER DEFAULT 0,
  actor_name varchar(255) DEFAULT 'System',
  action varchar(255) NOT NULL,
  details text DEFAULT NULL,
  severity VARCHAR(255) DEFAULT 'info',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabel: admin_targets
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_targets (
  id SERIAL,
  metric_key varchar(50) NOT NULL,
  target_value decimal(12,2) NOT NULL,
  label varchar(255) DEFAULT NULL,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (id),
  UNIQUE (metric_key)
);

-- ------------------------------------------------------------
-- Tabel: rank_levels
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rank_levels (
  id SERIAL,
  role VARCHAR(255) NOT NULL,
  name varchar(255) NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  benefits text DEFAULT NULL,
  color varchar(50) DEFAULT 'bg-stone-500',
  icon varchar(255) DEFAULT '?',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabel: quests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quests (
  id SERIAL,
  title varchar(255) NOT NULL,
  description text DEFAULT NULL,
  target_value INTEGER NOT NULL,
  reward_points INTEGER NOT NULL,
  category varchar(50) DEFAULT 'DAILY',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabel: user_quests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_quests (
  id SERIAL,
  user_id INTEGER NOT NULL,
  quest_id INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  is_completed SMALLINT DEFAULT 0,
  last_updated timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (id),
  CONSTRAINT user_quests_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT user_quests_ibfk_2 FOREIGN KEY (quest_id) REFERENCES quests (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: leaderboard_snapshots
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id SERIAL,
  user_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  period varchar(20) NOT NULL,
  snapshot_date date NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT leaderboard_snapshots_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: faqs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL,
  category varchar(255) NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabel: user_ai_keys
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_ai_keys (
  id SERIAL,
  user_id INTEGER NOT NULL,
  api_key varchar(255) NOT NULL,
  label varchar(255) DEFAULT 'My AI Key',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT user_ai_keys_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabel: corporate_ai_generations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS corporate_ai_generations (
  id SERIAL,
  donor_id INTEGER NOT NULL,
  food_id INTEGER DEFAULT NULL,
  type VARCHAR(255) NOT NULL,
  title varchar(255) DEFAULT NULL,
  content TEXT NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT corporate_ai_generations_ibfk_1 FOREIGN KEY (donor_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT corporate_ai_generations_ibfk_2 FOREIGN KEY (food_id) REFERENCES food_items (id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Tabel: verification_codes
-- Digunakan untuk OTP registrasi dan reset password.
-- identifier: email atau nomor telepon (E.164)
-- channel: 'email' | 'sms' | 'whatsapp'
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL,
  identifier varchar(255) NOT NULL ,
  code varchar(6) NOT NULL,
  channel VARCHAR(255) NOT NULL DEFAULT 'email',
  type VARCHAR(255) NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabel: email_verifications (legacy - tetap ada untuk kompatibilitas)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_verifications (
  id SERIAL,
  email varchar(255) NOT NULL,
  code varchar(6) NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- Tabel: password_resets (untuk reset password via token)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL,
  user_id INTEGER NOT NULL,
  token varchar(64) NOT NULL,
  expires_at timestamp NOT NULL,
  used_at timestamp NULL DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT password_resets_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Foreign key: users.selected_badge_id -> badges
-- (Ditambahkan terakhir karena badges harus sudah ada)
-- ------------------------------------------------------------
ALTER TABLE users
  ADD CONSTRAINT users_ibfk_1 
  FOREIGN KEY (selected_badge_id) REFERENCES badges (id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- Data default: system_settings
-- ------------------------------------------------------------
INSERT INTO system_settings (setting_key, setting_value) VALUES
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
('whatsappApiKey',     ''),
('require_otp_verification', 'true'),
('require_admin_verification', 'false')
ON CONFLICT (setting_key) DO NOTHING;

-- ------------------------------------------------------------
-- Data default: admin_targets
-- ------------------------------------------------------------
INSERT INTO admin_targets (metric_key, target_value, label) VALUES
('waste_kg',       50000.00,  'Target Penyelamatan Pangan'),
('co2_kg',         112500.00, 'Target Pengurangan CO2'),
('beneficiaries',  1000.00,   'Target Jangkauan Penerima')
ON CONFLICT (metric_key) DO NOTHING;



-- ------------------------------------------------------------
-- Data default: Akun Dummy untuk Pengujian
-- Password untuk semua akun adalah: 123456
-- ------------------------------------------------------------
INSERT INTO users (name, email, password, role, status, points) VALUES
('Superadmin', 'superadmin@demo.com', '$2b$10$4xQJk5DKe.N83VxjB7gBIehfk53y5cekHpWHKi9j1vozhXZkeO.AK', 'SUPER_ADMIN', 'ACTIVE', 0),
('penerima1', 'penerima1@demo.com', '$2b$10$NNYCDYFzUNOYOqEUSky0s.Ir4uxmwSEWAaelcpt4EAMPzAyyqyDDK', 'RECIPIENT', 'ACTIVE', 0),
('donaturKorporat', 'donaturkorporat@demo.com', '$2b$10$NNYCDYFzUNOYOqEUSky0s.Ir4uxmwSEWAaelcpt4EAMPzAyyqyDDK', 'CORPORATE_DONOR', 'ACTIVE', 0),
('donaturIndividu1', 'donaturindividu@demo.com', '$2b$10$NNYCDYFzUNOYOqEUSky0s.Ir4uxmwSEWAaelcpt4EAMPzAyyqyDDK', 'INDIVIDUAL_DONOR', 'ACTIVE', 0),
('relawan1', 'relawan1@demo.com', '$2b$10$NNYCDYFzUNOYOqEUSky0s.Ir4uxmwSEWAaelcpt4EAMPzAyyqyDDK', 'VOLUNTEER', 'ACTIVE', 0)
ON CONFLICT (email) DO NOTHING;
