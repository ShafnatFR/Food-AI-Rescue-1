/**
 * setupDatabase.js
 *
 * Dipanggil otomatis saat server start (npm run dev / npm start).
 * Alur:
 *   1. Coba koneksi ke MySQL
 *   2. Jika gagal → tampilkan pesan jelas dan hentikan server
 *   3. Jika berhasil → cek apakah database sudah ada
 *   4. Jika belum ada → buat database + jalankan schema.sql
 *   5. Jika sudah ada → lanjut (skip)
 */

const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_HOST     = process.env.DB_HOST     || 'localhost';
const DB_USER     = process.env.DB_USER     || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME     = process.env.DB_NAME     || 'foodairescue';
const DB_PORT     = process.env.DB_PORT     || 3306;

async function setupDatabase() {
    let connection;

    // ── 1. Coba koneksi ke MySQL (tanpa pilih database dulu) ──────────────────
    console.log(`\n[DB] Menghubungkan ke MySQL di ${DB_HOST}:${DB_PORT}...`);
    try {
        connection = await mysql.createConnection({
            host:               DB_HOST,
            port:               DB_PORT,
            user:               DB_USER,
            password:           DB_PASSWORD,
            multipleStatements: true,
        });
        console.log('[DB] ✅ Koneksi ke MySQL berhasil.');
    } catch (err) {
        console.error('\n[DB] ❌ GAGAL terhubung ke MySQL!');
        console.error(`     Host    : ${DB_HOST}:${DB_PORT}`);
        console.error(`     User    : ${DB_USER}`);
        console.error(`     Error   : ${err.message}`);
        console.error('\n     Pastikan XAMPP MySQL sudah berjalan, lalu coba lagi.\n');
        process.exit(1);
    }

    try {
        // ── 2. Cek apakah database sudah ada ─────────────────────────────────
        const [rows] = await connection.query(
            `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
            [DB_NAME]
        );

        if (rows.length > 0) {
            // Database sudah ada, tidak perlu buat ulang
            console.log(`[DB] ✅ Database '${DB_NAME}' sudah ada. Melewati inisialisasi.`);
        } else {
            // ── 3. Database belum ada → buat + jalankan schema ───────────────
            console.log(`[DB] ⚠️  Database '${DB_NAME}' tidak ditemukan.`);
            console.log(`[DB] 🔧 Membuat database '${DB_NAME}'...`);

            await connection.query(
                `CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`
            );
            console.log(`[DB] ✅ Database '${DB_NAME}' berhasil dibuat.`);

            await connection.query(`USE \`${DB_NAME}\``);

            // Baca dan jalankan schema.sql
            const schemaPath = path.join(__dirname, 'schema.sql');
            if (!fs.existsSync(schemaPath)) {
                throw new Error(`File schema.sql tidak ditemukan di: ${schemaPath}`);
            }

            console.log('[DB] 📄 Menjalankan schema.sql...');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await connection.query(schemaSql);

            console.log('[DB] ✅ Semua tabel berhasil dibuat dari schema.sql.');
            console.log(`[DB] 🎉 Database '${DB_NAME}' siap digunakan!\n`);
        }
    } catch (err) {
        console.error('\n[DB] ❌ Gagal menginisialisasi database!');
        console.error(`     Error: ${err.message}\n`);
        await connection.end();
        process.exit(1);
    } finally {
        await connection.end();
    }
}

module.exports = setupDatabase;
