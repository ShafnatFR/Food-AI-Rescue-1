const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkAndReset() {
    const args = process.argv.slice(2);
    
    // Normalize arguments (e.g. handle --reset_all or -reset_all)
    const hasResetWa = args.some(arg => arg.includes('reset_wa'));
    const hasResetDb = args.some(arg => arg.includes('reset_db'));
    const hasResetAll = args.some(arg => arg.includes('reset_all'));

    const shouldResetWa = hasResetWa || hasResetAll;
    const shouldResetDb = hasResetDb || hasResetAll;

    if (!shouldResetWa && !shouldResetDb) {
        return; // No reset requested
    }

    console.log('\n=============================================');
    console.log('🔄 MENDETEKSI PERINTAH RESET...');

    // 1. Reset WA Session
    if (shouldResetWa) {
        console.log('[RESET] Menghapus sesi WhatsApp...');
        const authPaths = [
            path.join(__dirname, '.wwebjs_auth'),
            path.join(__dirname, '../.wwebjs_auth')
        ];

        for (const authPath of authPaths) {
            if (fs.existsSync(authPath)) {
                try {
                    fs.rmSync(authPath, { recursive: true, force: true });
                    console.log(`[RESET] ✅ Folder sesi WA terhapus: ${authPath}`);
                } catch (err) {
                    console.error(`[RESET] ❌ Gagal menghapus folder sesi WA: ${err.message}`);
                }
            }
        }
    }

    // 2. Reset Database
    if (shouldResetDb) {
        console.log('[RESET] Menghapus Database...');
        const DB_HOST     = process.env.DB_HOST     || 'localhost';
        const DB_USER     = process.env.DB_USER     || 'root';
        const DB_PASSWORD = process.env.DB_PASSWORD || '';
        const DB_NAME     = process.env.DB_NAME     || 'foodairescue';
        const DB_PORT     = process.env.DB_PORT     || 3306;

        let connection;
        try {
            connection = await mysql.createConnection({
                host: DB_HOST,
                port: DB_PORT,
                user: DB_USER,
                password: DB_PASSWORD
            });

            await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
            console.log(`[RESET] ✅ Database '${DB_NAME}' berhasil dihapus.`);
        } catch (err) {
            console.error(`[RESET] ❌ Gagal menghapus database: ${err.message}`);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }

    console.log('=============================================\n');
}

module.exports = checkAndReset;
