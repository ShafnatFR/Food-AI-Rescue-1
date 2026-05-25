/**
 * migrate_otp.js
 *
 * Migration script untuk menambah kolom baru ke tabel verification_codes
 * dan membuat tabel email_verifications + password_resets jika belum ada.
 *
 * Jalankan SEKALI: node server/migrate_otp.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const DB_HOST     = process.env.DB_HOST     || 'localhost';
const DB_PORT     = process.env.DB_PORT     || 3306;
const DB_USER     = process.env.DB_USER     || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME     = process.env.DB_NAME     || 'foodairescue';

async function migrate() {
    const conn = await mysql.createConnection({
        host: DB_HOST, port: DB_PORT, user: DB_USER,
        password: DB_PASSWORD, database: DB_NAME,
        multipleStatements: true,
    });

    console.log('[MIGRATE] Terhubung ke database:', DB_NAME);

    try {
        // 1. Cek kolom yang ada di verification_codes
        const [cols] = await conn.query(
            `SELECT COLUMN_NAME FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'verification_codes'`,
            [DB_NAME]
        );
        const existingCols = cols.map(c => c.COLUMN_NAME);
        console.log('[MIGRATE] Kolom saat ini di verification_codes:', existingCols);

        // 2. Tambah kolom identifier jika belum ada
        if (!existingCols.includes('identifier')) {
            await conn.query(`
                ALTER TABLE verification_codes
                ADD COLUMN identifier varchar(255) NOT NULL DEFAULT '' COMMENT 'email atau nomor telepon E.164'
                AFTER id
            `);
            // Migrasi data lama: salin email ke identifier
            if (existingCols.includes('email')) {
                await conn.query(`UPDATE verification_codes SET identifier = email WHERE identifier = ''`);
            }
            console.log('[MIGRATE] ✅ Kolom identifier ditambahkan.');
        } else {
            console.log('[MIGRATE] ⏭  Kolom identifier sudah ada.');
        }

        // 3. Tambah kolom channel jika belum ada
        if (!existingCols.includes('channel')) {
            await conn.query(`
                ALTER TABLE verification_codes
                ADD COLUMN channel enum('email','sms','whatsapp') NOT NULL DEFAULT 'email'
                AFTER identifier
            `);
            console.log('[MIGRATE] ✅ Kolom channel ditambahkan.');
        } else {
            console.log('[MIGRATE] ⏭  Kolom channel sudah ada.');
        }

        // 4. Pastikan kolom type ada
        if (!existingCols.includes('type')) {
            await conn.query(`
                ALTER TABLE verification_codes
                ADD COLUMN type enum('REGISTRATION','PASSWORD_RESET') NOT NULL DEFAULT 'REGISTRATION'
                AFTER channel
            `);
            console.log('[MIGRATE] ✅ Kolom type ditambahkan.');
        } else {
            console.log('[MIGRATE] ⏭  Kolom type sudah ada.');
        }

        // 5. Fix expires_at (hapus ON UPDATE jika ada)
        await conn.query(`
            ALTER TABLE verification_codes
            MODIFY COLUMN expires_at timestamp NOT NULL
        `).catch(() => {}); // ignore jika sudah benar

        // 6. Tambah index baru
        await conn.query(`
            ALTER TABLE verification_codes
            ADD INDEX idx_identifier_channel (identifier, channel, type)
        `).catch(() => {}); // ignore jika sudah ada

        // 7. Buat tabel email_verifications (legacy)
        await conn.query(`
            CREATE TABLE IF NOT EXISTS email_verifications (
                id int(11) NOT NULL AUTO_INCREMENT,
                email varchar(255) NOT NULL,
                code varchar(6) NOT NULL,
                expires_at timestamp NOT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id),
                KEY email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('[MIGRATE] ✅ Tabel email_verifications siap.');

        // 8. Buat tabel password_resets
        await conn.query(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id int(11) NOT NULL AUTO_INCREMENT,
                user_id int(11) NOT NULL,
                token varchar(64) NOT NULL,
                expires_at timestamp NOT NULL,
                used_at timestamp NULL DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id),
                KEY token (token),
                KEY user_id (user_id),
                CONSTRAINT password_resets_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('[MIGRATE] ✅ Tabel password_resets siap.');

        console.log('\n[MIGRATE] 🎉 Migration selesai! Database siap untuk fitur OTP multi-channel.\n');
    } catch (err) {
        console.error('[MIGRATE] ❌ Error:', err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

migrate();
