# DATABASE SCHEMA DOCUMENTATION
## Food AI Rescue Platform

**Database Name:** `foodairescue`
**Database Type:** MySQL 8.0+
**Character Set:** utf8mb4
**Collation:** utf8mb4_general_ci

---

## TABLE STRUCTURE

### 1. USERS
**Purpose:** Store user accounts and profiles
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | User ID |
| name | VARCHAR(255) | NO | - | User full name |
| email | VARCHAR(255) | NO | UNIQUE | Email address |
| password | VARCHAR(255) | NO | - | Hashed password |
| phone | VARCHAR(255) | YES | NULL | Phone number |
| role | ENUM | NO | - | User role (INDIVIDUAL_DONOR, CORPORATE_DONOR, RECIPIENT, VOLUNTEER, ADMIN, SUPER_ADMIN) |
| status | ENUM | YES | PENDING | Account status (ACTIVE, PENDING, INACTIVE, SUSPENDED) |
| points | INT(11) | YES | 0 | Accumulated points |
| avatar | VARCHAR(255) | YES | NULL | Avatar URL |
| selected_badge_id | INT(11) | YES | NULL | FK to badges.id |
| permissions | LONGTEXT | YES | NULL | JSON permissions |
| ai_subscription_status | ENUM | YES | FREE | AI subscription (FREE, SUBSCRIBER) |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

---

### 2. FOOD_ITEMS
**Purpose:** Store food listings from donors
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Food item ID |
| provider_id | INT(11) | NO | - | FK to users.id (donor) |
| name | VARCHAR(255) | NO | - | Food name |
| description | TEXT | YES | NULL | Food description |
| initial_quantity | INT(11) | NO | - | Initial quantity |
| current_quantity | INT(11) | NO | - | Remaining quantity |
| expiry_time | DATETIME | NO | - | Expiry date/time |
| delivery_method | ENUM | NO | - | PICKUP, DELIVERY, or BOTH |
| category | ENUM | YES | OTHER | READY_TO_EAT, GROCERIES, BAKERY, FROZEN_FOOD, OTHER |
| status | ENUM | YES | AVAILABLE | AVAILABLE, RESERVED, CLAIMED, COMPLETED, EXPIRED |
| image_url | VARCHAR(255) | YES | NULL | Food photo URL |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

---

### 3. CLAIMS
**Purpose:** Store food claims/orders from recipients
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Claim ID |
| food_id | INT(11) | NO | - | FK to food_items.id |
| receiver_id | INT(11) | NO | - | FK to users.id (recipient) |
| volunteer_id | INT(11) | YES | NULL | FK to users.id (volunteer) |
| address_id | INT(11) | NO | - | FK to addresses.id |
| claimed_quantity | INT(11) | NO | - | Quantity claimed |
| delivery_method | ENUM | NO | - | PICKUP or DELIVERY |
| status | ENUM | YES | PENDING | PENDING, IN_PROGRESS, COMPLETED, CANCELLED |
| unique_code | VARCHAR(255) | YES | NULL | QR code identifier |
| is_scanned | TINYINT(1) | YES | 0 | Has QR been scanned |
| courier_name | VARCHAR(255) | YES | NULL | Volunteer/courier name |
| courier_status | VARCHAR(50) | YES | NULL | Courier status |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Claim creation time |
| completed_at | TIMESTAMP | YES | NULL | Completion time |

---

### 4. ADDRESSES
**Purpose:** Store user addresses (home, office, organization)
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Address ID |
| user_id | INT(11) | NO | - | FK to users.id |
| label | VARCHAR(255) | NO | - | Address label (Rumah, Kantor, etc) |
| full_address | TEXT | NO | - | Complete address |
| latitude | DECIMAL(10,8) | NO | - | GPS latitude |
| longitude | DECIMAL(11,8) | NO | - | GPS longitude |
| contact_name | VARCHAR(255) | NO | - | Contact person name |
| contact_phone | VARCHAR(255) | NO | - | Contact phone number |
| is_primary | TINYINT(1) | YES | 0 | Is default address |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

---

### 5. REVIEWS
**Purpose:** Store ratings and reviews for transactions
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Review ID |
| claim_id | INT(11) | NO | UNIQUE | FK to claims.id |
| user_id | INT(11) | NO | - | FK to users.id (reviewer) |
| partner_id | INT(11) | NO | - | FK to users.id (reviewed) |
| food_id | INT(11) | NO | - | FK to food_items.id |
| rating | INT(11) | NO | - | Rating (1-5 stars) |
| comment | TEXT | YES | NULL | Review comment |
| review_media | LONGTEXT | YES | NULL | JSON array of photo URLs |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Review creation time |

---

### 6. REPORTS
**Purpose:** Store moderation reports for violations
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Report ID |
| reporter_id | INT(11) | NO | - | FK to users.id (reporter) |
| claim_id | INT(11) | NO | - | FK to claims.id |
| category | VARCHAR(255) | YES | NULL | Report category |
| title | VARCHAR(255) | YES | NULL | Report title |
| description | TEXT | YES | NULL | Detailed description |
| evidence_photo | LONGTEXT | YES | NULL | JSON array of evidence URLs |
| status | ENUM | YES | NEW | NEW, IN_PROGRESS, RESOLVED, REJECTED |
| is_urgent | TINYINT(1) | YES | 0 | Is urgent |
| admin_notes | TEXT | YES | NULL | Admin notes |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Report creation time |

---

### 7. NOTIFICATIONS
**Purpose:** Store user notifications
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Notification ID |
| user_id | INT(11) | NO | - | FK to users.id |
| type | VARCHAR(255) | NO | - | Notification type |
| title | VARCHAR(255) | NO | - | Notification title |
| message | TEXT | NO | - | Notification message |
| linked_id | INT(11) | YES | NULL | Related entity ID |
| is_read | TINYINT(1) | YES | 0 | Has been read |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

---

### 8. BROADCASTS
**Purpose:** Store admin broadcast messages
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Broadcast ID |
| title | VARCHAR(255) | NO | - | Broadcast title |
| content | TEXT | NO | - | Broadcast content |
| target | VARCHAR(255) | NO | - | Target audience (all, provider, volunteer, recipient, admin) |
| type | VARCHAR(255) | YES | info | Message type (info, success, warning) |
| author_id | INT(11) | YES | NULL | FK to users.id (admin) |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

---

### 9. BADGES
**Purpose:** Store achievement badges/medals
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Badge ID |
| name | VARCHAR(255) | NO | - | Badge name (e.g., "First Donation") |
| role | ENUM | YES | NULL | Target role |
| min_points | INT(11) | YES | 0 | Minimum points to unlock |
| icon | VARCHAR(255) | YES | NULL | Icon emoji or URL |
| description | TEXT | YES | NULL | Badge description |
| image | TEXT | YES | NULL | Badge image URL |

---

### 10. RANK_LEVELS
**Purpose:** Store gamification rank levels
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Rank ID |
| role | ENUM | NO | - | Target role (PROVIDER, VOLUNTEER, RECIPIENT) |
| name | VARCHAR(255) | NO | - | Rank name (Bronze, Silver, Gold, etc) |
| min_points | INT(11) | NO | 0 | Minimum points to achieve |
| benefits | TEXT | YES | NULL | JSON array of benefits |
| color | VARCHAR(50) | YES | bg-stone-500 | Tailwind color class |
| icon | VARCHAR(255) | YES | ? | Icon emoji |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

---

### 11. SYSTEM_SETTINGS
**Purpose:** Store application configuration
**Primary Key:** `setting_key`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| setting_key | VARCHAR(50) | NO | - | Setting key |
| setting_value | TEXT | YES | NULL | Setting value |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

**Default Settings:**
- `appName` = "Food AI Rescue"
- `appSlogan` = "Selamatkan Makanan, Selamatkan Bumi"
- `supportPhone` = "628123456789"
- `pointsPerKg` = "100"
- `co2Multiplier` = "2.5"
- `disableExpiryLogic` = "false"
- `maintenance` = "false"
- `disable_signup` = "false"
- `readonly_mode` = "false"

---

### 12. SYSTEM_LOGS
**Purpose:** Audit trail of system activities
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Log ID |
| actor_id | INT(11) | YES | 0 | FK to users.id (who did it) |
| actor_name | VARCHAR(255) | YES | System | Actor name |
| action | VARCHAR(255) | NO | - | Action performed |
| details | TEXT | YES | NULL | Action details |
| severity | ENUM | YES | info | info, warning, critical |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Log time |

---

### 13. FAQS
**Purpose:** Store FAQ content for help center
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | FAQ ID |
| category | VARCHAR(255) | NO | - | FAQ category |
| question | TEXT | NO | - | Question text |
| answer | TEXT | NO | - | Answer text |

---

### 14. POINT_HISTORIES
**Purpose:** Track point transactions for each user
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | History ID |
| user_id | INT(11) | NO | - | FK to users.id |
| amount | INT(11) | NO | - | Points added/deducted |
| activity_type | VARCHAR(255) | NO | - | Activity type (donation, claim, review, etc) |
| reference_id | INT(11) | YES | NULL | Related entity ID |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Transaction time |

---

### 15. AI_VERIFICATIONS
**Purpose:** Store AI verification results for food items
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Verification ID |
| food_id | INT(11) | NO | UNIQUE | FK to food_items.id |
| is_edible | TINYINT(1) | NO | - | Is food safe to eat |
| halal_score | INT(11) | NO | - | Halal certification score (0-100) |
| quality_score | INT(11) | YES | NULL | Food quality score (0-100) |
| reason | TEXT | YES | NULL | Verification reason/notes |
| ingredients | LONGTEXT | YES | NULL | JSON array of ingredients |
| allergens | TEXT | YES | NULL | Allergen information |

---

### 16. SOCIAL_IMPACTS
**Purpose:** Store environmental impact data per food item
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Impact ID |
| food_id | INT(11) | NO | UNIQUE | FK to food_items.id |
| total_potential_points | INT(11) | YES | NULL | Total points possible |
| co2_per_portion | DECIMAL(8,2) | YES | NULL | CO2 saved per portion (kg) |
| water_saved_liter | DECIMAL(8,2) | YES | NULL | Water saved (liters) |
| land_saved_sqm | DECIMAL(8,2) | YES | NULL | Land saved (sqm) |
| impact_details | LONGTEXT | YES | NULL | JSON detailed breakdown |

---

### 17. USER_IMPACT_STATS
**Purpose:** Aggregate impact statistics per user
**Primary Key:** `user_id`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | INT(11) | NO | - | FK to users.id |
| total_waste_kg | DECIMAL(10,2) | YES | 0.00 | Total waste rescued (kg) |
| total_co2_kg | DECIMAL(10,2) | YES | 0.00 | Total CO2 saved (kg) |
| total_water_liter | DECIMAL(10,2) | YES | 0.00 | Total water saved (liters) |
| total_land_sqm | DECIMAL(10,2) | YES | 0.00 | Total land saved (sqm) |
| last_updated | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

---

### 18. QUESTS
**Purpose:** Store daily/weekly quests for gamification
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Quest ID |
| title | VARCHAR(255) | NO | - | Quest title |
| description | TEXT | YES | NULL | Quest description |
| target_value | INT(11) | NO | - | Target to complete |
| reward_points | INT(11) | NO | - | Points reward |
| category | VARCHAR(50) | YES | DAILY | Quest category (DAILY, WEEKLY, MONTHLY) |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

---

### 19. USER_QUESTS
**Purpose:** Track user progress on quests
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | User Quest ID |
| user_id | INT(11) | NO | - | FK to users.id |
| quest_id | INT(11) | NO | - | FK to quests.id |
| current_value | INT(11) | YES | 0 | Current progress |
| is_completed | TINYINT(1) | YES | 0 | Is quest completed |
| last_updated | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

---

### 20. LEADERBOARD_SNAPSHOTS
**Purpose:** Store historical leaderboard rankings
**Primary Key:** `id` (AUTO_INCREMENT)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT(11) | NO | AUTO_INCREMENT | Snapshot ID |
| user_id | INT(11) | NO | - | FK to users.id |
| points | INT(11) | NO | - | Points at snapshot |
| rank | INT(11) | NO | - | Rank at snapshot |
| period | VARCHAR(20) | NO | - | Period (DAILY, WEEKLY, MONTHLY) |
| snapshot_date | DATE | NO | - | Snapshot date |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

---

## TOTAL TABLES: 26

**Core Tables:** users, food_items, claims, addresses, reviews, reports
**Gamification:** badges, rank_levels, quests, user_quests, leaderboard_snapshots
**Communication:** notifications, broadcasts, broadcast_reads, faqs
**Analytics:** point_histories, user_impact_stats, system_logs, admin_targets
**AI Features:** ai_verifications, social_impacts, user_ai_keys, corporate_ai_generations
**System:** system_settings, verification_codes, food_requests

---

**Last Updated:** 2026-05-25
**Schema Version:** 1.0
