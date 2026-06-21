const fs = require('fs');
const path = require('path');
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

    // 2. Reset Database (Disabled for PostgreSQL/Supabase production safety)
    if (shouldResetDb) {
        console.log('[RESET] Menghapus Database...');
        console.log('[RESET] ⚠️ Reset DB otomatis dinonaktifkan untuk Supabase/PostgreSQL.');
    }

    console.log('=============================================\n');
}

module.exports = checkAndReset;
