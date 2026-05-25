/**
 * whatsappService.js
 *
 * WhatsApp client gratis menggunakan whatsapp-web.js.
 * Cara kerja: library ini menjalankan WhatsApp Web di background (via Puppeteer).
 *
 * SETUP PERTAMA KALI:
 *   1. Jalankan server → QR code muncul di terminal
 *   2. Buka WhatsApp di HP nomor admin/bot
 *   3. Perangkat Tertaut → Tautkan Perangkat → Scan QR
 *   4. Sesi tersimpan di folder .wwebjs_auth/ → tidak perlu scan ulang selama sesi aktif
 *
 * STATUS:
 *   - waStatus: 'initializing' | 'qr_pending' | 'ready' | 'disconnected'
 *   - Cek via GET /api/wa-status
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path   = require('path');

// ─── State ────────────────────────────────────────────────────────────────────
let waClient = null;
let waStatus = 'initializing'; // 'initializing' | 'qr_pending' | 'ready' | 'disconnected'
let lastQr   = null;           // QR string terakhir (untuk endpoint status)

// ─── Inisialisasi Client ──────────────────────────────────────────────────────

/**
 * Inisialisasi WhatsApp client.
 * Dipanggil sekali saat server start dari index.js.
 * Sesi disimpan di .wwebjs_auth/ agar tidak perlu scan ulang.
 */
function initWhatsApp() {
    if (waClient) return; // Sudah diinisialisasi

    console.log('\n[WA] 🟡 Menginisialisasi WhatsApp client...');
    console.log('[WA]    Sesi tersimpan di folder .wwebjs_auth/');
    console.log('[WA]    Jika ini pertama kali, QR code akan muncul di bawah.\n');

    waClient = new Client({
        authStrategy: new LocalAuth({
            dataPath: path.join(__dirname, '../../.wwebjs_auth'),
        }),
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        },

        puppeteer: {
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
        },
    });

    // ── Event: QR Code ────────────────────────────────────────────────────────
    waClient.on('qr', (qr) => {
        waStatus = 'qr_pending';
        lastQr   = qr;
        console.log('\n[WA] 📱 Scan QR code ini dengan WhatsApp (nomor bot/admin):');
        console.log('[WA]    WhatsApp → Perangkat Tertaut → Tautkan Perangkat\n');
        qrcode.generate(qr, { small: true });
        console.log('\n[WA] Menunggu scan...\n');
    });

    // ── Event: Authenticated ──────────────────────────────────────────────────
    waClient.on('authenticated', () => {
        console.log('[WA] ✅ Autentikasi berhasil. Memuat sesi...');
        
        // WORKAROUND: Force "ready" status after 10 seconds if it's stuck
        setTimeout(() => {
            if (waStatus !== 'ready') {
                waStatus = 'ready';
                console.log(`[WA] 🟢 WhatsApp dipaksa siap (Bypass ready event bug)!`);
            }
        }, 10000);
    });

    // ── Event: Ready ──────────────────────────────────────────────────────────
    waClient.on('ready', () => {
        waStatus = 'ready';
        lastQr   = null;
        const info = waClient.info;
        console.log(`[WA] 🟢 WhatsApp siap! Terhubung sebagai: ${info?.pushname} (${info?.wid?.user})`);
    });

    // ── Event: Disconnected ───────────────────────────────────────────────────
    waClient.on('disconnected', (reason) => {
        waStatus = 'disconnected';
        waClient = null;
        console.warn(`[WA] 🔴 WhatsApp terputus: ${reason}`);
        console.warn('[WA]    Restart server untuk menghubungkan ulang.');
    });

    // ── Event: Auth Failure ───────────────────────────────────────────────────
    waClient.on('auth_failure', (msg) => {
        waStatus = 'disconnected';
        console.error(`[WA] ❌ Autentikasi gagal: ${msg}`);
    });

    waClient.initialize().catch(err => {
        console.error('[WA] ❌ Gagal menginisialisasi WhatsApp client:', err.message);
        waStatus = 'disconnected';
    });
}

// ─── Kirim Pesan ─────────────────────────────────────────────────────────────

/**
 * Normalisasi nomor telepon ke format WhatsApp ID (628xxx@c.us)
 * Contoh: 08123456789 → 628123456789@c.us
 */
function toWhatsAppId(phone) {
    const digits = String(phone).replace(/\D/g, '');
    let normalized = digits;

    if (digits.startsWith('0')) {
        normalized = '62' + digits.slice(1);
    } else if (digits.startsWith('+')) {
        normalized = digits.slice(1);
    }
    // Jika sudah 62xxx, biarkan

    return normalized + '@c.us';
}

/**
 * Kirim pesan WhatsApp.
 * @param {string} phone - nomor tujuan (format apapun)
 * @param {string} message - isi pesan (mendukung *bold*, _italic_)
 * @throws Error jika client belum ready
 */
async function sendWhatsAppMessage(phone, message) {
    if (!waClient || waStatus !== 'ready') {
        const statusMsg = waStatus === 'qr_pending'
            ? 'WhatsApp belum terhubung. Silakan scan QR code di terminal server terlebih dahulu.'
            : waStatus === 'initializing'
            ? 'WhatsApp sedang diinisialisasi. Tunggu beberapa saat lalu coba lagi.'
            : 'WhatsApp terputus. Hubungi admin untuk restart server.';

        const err = new Error(statusMsg);
        err.statusCode = 503;
        throw err;
    }

    const chatId = toWhatsAppId(phone);
    try {
        const registered = await waClient.getNumberId(chatId);
        if (!registered) {
            const err = new Error('Nomor WhatsApp tidak terdaftar.');
            err.statusCode = 400;
            throw err;
        }
        await waClient.sendMessage(registered._serialized, message, { sendSeen: false });
    } catch (error) {
        if (error.message.includes('No LID for user')) {
            console.error('[WA] Fallback sending without LID check for', chatId);
            await waClient.sendMessage(chatId, message, { sendSeen: false });
        } else {
            throw error;
        }
    }
    console.log(`[WA] ✉️  Pesan terkirim ke ${chatId}`);
}

/**
 * Kirim OTP via WhatsApp dengan format pesan yang rapi.
 */
async function sendOtpWhatsApp(phone, name, code) {
    const message =
        `🌿 *Food AI Rescue*\n` +
        `_Selamatkan Makanan, Selamatkan Bumi_\n\n` +
        `Halo *${name}*! 👋\n\n` +
        `Kode OTP pendaftaran Anda:\n\n` +
        `┌─────────────────┐\n` +
        `│   *${code}*   │\n` +
        `└─────────────────┘\n\n` +
        `⏱ Berlaku *15 menit*\n` +
        `🔒 Jangan bagikan kode ini kepada siapa pun.\n\n` +
        `_Jika Anda tidak mendaftar, abaikan pesan ini._`;

    await sendWhatsAppMessage(phone, message);
}

// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * Dapatkan status koneksi WhatsApp saat ini.
 */
function getWhatsAppStatus() {
    return {
        status: waStatus,
        isReady: waStatus === 'ready',
        hasQr: waStatus === 'qr_pending',
        info: waStatus === 'ready' ? {
            name: waClient?.info?.pushname,
            phone: waClient?.info?.wid?.user,
        } : null,
    };
}

module.exports = {
    initWhatsApp,
    sendWhatsAppMessage,
    sendOtpWhatsApp,
    getWhatsAppStatus,
    toWhatsAppId,
};
