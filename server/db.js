const { Pool } = require('pg');
const path = require('path');
// No setupDatabase needed for Supabase as DB is already created
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let pool = null;

async function initPool() {
    // Determine connection config. If DB_URL exists, use it. Otherwise assemble.
    const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'postgres'}`;

    pool = new Pool({
        connectionString,
        max: 10, // max number of clients in the pool
        idleTimeoutMillis: 30000
    });

    try {
        const client = await pool.connect();
        client.release();
        console.log('[DB] ✅ Connection pool siap (PostgreSQL).');
    } catch (err) {
        console.error('[DB] ❌ Gagal koneksi ke PostgreSQL:', err.message);
        throw err;
    }
}

/**
 * Helper to convert MySQL ? placeholders to PostgreSQL $1, $2 placeholders
 */
function convertQuery(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
}

const db = {
    initPool,

    async query(sql, params = []) {
        if (!pool) throw new Error('[DB] Pool belum siap. initPool() harus dipanggil lebih dulu.');
        const pgSql = convertQuery(sql);
        try {
            const result = await pool.query(pgSql, params);
            // Simulate MySQL [rows, fields] return format
            // In MySQL, INSERT returns an object with insertId in the first element
            // pg returns result.rows
            if (pgSql.trim().toUpperCase().startsWith('INSERT') || pgSql.trim().toUpperCase().startsWith('UPDATE') || pgSql.trim().toUpperCase().startsWith('DELETE')) {
                // If it's an INSERT and has a RETURNING clause (which we probably don't have yet), it would be in rows
                // We mock the MySQL result object structure
                const mockResult = {
                    insertId: (result.rows && result.rows.length > 0 && result.rows[0].id) ? result.rows[0].id : null,
                    affectedRows: result.rowCount
                };
                return [mockResult, result.fields];
            }
            return [result.rows, result.fields];
        } catch (err) {
            console.error('[DB Error]', err.message, '\\nQuery:', pgSql, params);
            throw err;
        }
    },

    async execute(sql, params = []) {
        // execute in pg is basically the same as query
        return this.query(sql, params);
    },

    async getConnection() {
        if (!pool) throw new Error('[DB] Pool belum siap. initPool() harus dipanggil lebih dulu.');
        const client = await pool.connect();
        
        // Wrap the client to simulate MySQL connection interface
        const wrappedClient = {
            query: async (sql, params = []) => {
                const pgSql = convertQuery(sql);
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
    }
};

module.exports = db;
