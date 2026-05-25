const mysql         = require('mysql2/promise');
const path          = require('path');
const setupDatabase = require('./setupDatabase');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let pool = null;

/**
 * Inisialisasi pool koneksi.
 * Dipanggil sekali dari index.js sebelum server mulai listen.
 */
async function initPool() {
    // Jalankan setup: cek koneksi, buat DB + tabel jika belum ada
    await setupDatabase();

    pool = mysql.createPool({
        host:               process.env.DB_HOST     || 'localhost',
        port:               process.env.DB_PORT     || 3306,
        user:               process.env.DB_USER     || 'root',
        password:           process.env.DB_PASSWORD || '',
        database:           process.env.DB_NAME     || 'foodairescue',
        waitForConnections: true,
        connectionLimit:    10,
        queueLimit:         0,
    });

    console.log('[DB] ✅ Connection pool siap.');
}

/**
 * Semua akses ke db.query(), db.execute(), dll. diteruskan ke pool.
 * initPool() harus dipanggil lebih dulu sebelum query apapun.
 */
const db = {
    initPool,

    query(...args) {
        if (!pool) throw new Error('[DB] Pool belum siap. initPool() harus dipanggil lebih dulu.');
        return pool.query(...args);
    },

    execute(...args) {
        if (!pool) throw new Error('[DB] Pool belum siap. initPool() harus dipanggil lebih dulu.');
        return pool.execute(...args);
    },

    getConnection(...args) {
        if (!pool) throw new Error('[DB] Pool belum siap. initPool() harus dipanggil lebih dulu.');
        return pool.getConnection(...args);
    },
};

module.exports = db;
