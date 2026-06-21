const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let pool = null;
let isPostgres = false;

// Helpers
function isPgUrl(url) {
    return url && url.startsWith('postgresql://');
}

async function initPool() {
    const connectionString = process.env.DATABASE_URL || '';
    isPostgres = isPgUrl(connectionString);

    if (isPostgres) {
        const { Pool } = require('pg');
        const pgUrl = connectionString || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'postgres'}`;
        
        pool = new Pool({
            connectionString: pgUrl,
            max: process.env.VERCEL ? 1 : 5,
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 10000
        });

        try {
            const client = await pool.connect();
            client.release();
            console.log('[DB] ✅ Connection pool siap (PostgreSQL).');
        } catch (err) {
            console.error('[DB] ❌ Gagal koneksi ke PostgreSQL:', err.message);
            throw err;
        }
    } else {
        const mysql = require('mysql2/promise');
        const mysqlUrl = connectionString || `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'food_rescue_db'}`;
        
        try {
            pool = mysql.createPool(mysqlUrl);
            const connection = await pool.getConnection();
            connection.release();
            console.log('[DB] ✅ Connection pool siap (MySQL).');
        } catch (err) {
            console.error('[DB] ❌ Gagal koneksi ke MySQL:', err.message);
            throw err;
        }
    }
}

/**
 * Helper to convert MySQL ? placeholders to PostgreSQL $1, $2 placeholders
 */
function convertQueryToPg(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
}

const db = {
    initPool,
    
    get isPostgres() {
        return isPostgres;
    },

    async query(sql, params = []) {
        if (!pool) throw new Error('[DB] Pool belum siap. initPool() harus dipanggil lebih dulu.');
        
        if (isPostgres) {
            const pgSql = convertQueryToPg(sql);
            try {
                const result = await pool.query(pgSql, params);
                if (pgSql.trim().toUpperCase().startsWith('INSERT') || pgSql.trim().toUpperCase().startsWith('UPDATE') || pgSql.trim().toUpperCase().startsWith('DELETE')) {
                    const mockResult = {
                        insertId: (result.rows && result.rows.length > 0 && result.rows[0].id) ? result.rows[0].id : null,
                        affectedRows: result.rowCount
                    };
                    return [mockResult, result.fields];
                }
                return [result.rows, result.fields];
            } catch (err) {
                console.error('[DB PG Error]', err.message, '\nQuery:', pgSql, params);
                throw err;
            }
        } else {
            try {
                const [rows, fields] = await pool.query(sql, params);
                return [rows, fields];
            } catch (err) {
                console.error('[DB MySQL Error]', err.message, '\nQuery:', sql, params);
                throw err;
            }
        }
    },

    async execute(sql, params = []) {
        if (isPostgres) {
            return this.query(sql, params);
        } else {
            if (!pool) throw new Error('[DB] Pool belum siap. initPool() harus dipanggil lebih dulu.');
            return pool.execute(sql, params);
        }
    },

    async getConnection() {
        if (!pool) throw new Error('[DB] Pool belum siap. initPool() harus dipanggil lebih dulu.');
        
        if (isPostgres) {
            const client = await pool.connect();
            const wrappedClient = {
                query: async (sql, params = []) => {
                    const pgSql = convertQueryToPg(sql);
                    const result = await client.query(pgSql, params);
                    if (pgSql.trim().toUpperCase().startsWith('INSERT') || pgSql.trim().toUpperCase().startsWith('UPDATE') || pgSql.trim().toUpperCase().startsWith('DELETE')) {
                        const mockResult = {
                            insertId: (result.rows && result.rows.length > 0 && result.rows[0].id) ? result.rows[0].id : null,
                            affectedRows: result.rowCount
                        };
                        return [mockResult, result.fields];
                    }
                    return [result.rows, result.fields];
                },
                execute: async function(sql, params = []) {
                    return this.query(sql, params);
                },
                beginTransaction: async () => client.query('BEGIN'),
                commit: async () => client.query('COMMIT'),
                rollback: async () => client.query('ROLLBACK'),
                release: () => client.release()
            };
            return wrappedClient;
        } else {
            const connection = await pool.getConnection();
            return connection;
        }
    }
};

module.exports = db;
