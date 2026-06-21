/**
 * otpService.js
 *
 * Layanan OTP terpusat untuk registrasi user.
 * Channel yang didukung:
 *   - email     : Gmail SMTP via Nodemailer (berbayar domain, gratis untuk Gmail)
 *   - whatsapp  : whatsapp-web.js (100% gratis, scan QR sekali)
 *
 * Tabel: verification_codes
 * Kolom: id, identifier, code, channel, type, expires_at, created_at
 */

const nodemailer = require('nodemailer');
const db = require('../db');
const { sendOtpWhatsApp } = require('./whatsappService');
require('dotenv').config();

// ─── Nodemailer Transporter ───────────────────────────────────────────────────
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate kode OTP 6 digit numerik
 */
function generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Normalisasi nomor telepon ke format E.164 (+62...)
 * Contoh: 08123456789 → +628123456789
 */
function normalizePhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('0'))  return '+62' + digits.slice(1);
    if (digits.startsWith('62')) return '+' + digits;
    if (String(phone).startsWith('+')) return '+' + digits;
    return '+62' + digits;
}

// ─── Database ─────────────────────────────────────────────────────────────────

/**
 * Simpan OTP ke tabel verification_codes.
 * @param {string} identifier - email atau nomor telepon
 * @param {string} code
 * @param {'email'|'whatsapp'} channel
 * @param {'REGISTRATION'|'PASSWORD_RESET'} type
 */
async function saveOtp(identifier, code, channel, type = 'REGISTRATION') {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    // Hapus kode lama untuk identifier + channel yang sama
    await db.query(
        'DELETE FROM verification_codes WHERE identifier = ? AND channel = ? AND type = ?',
        [identifier, channel, type]
    );

    await db.query(
        'INSERT INTO verification_codes (identifier, code, channel, type, expires_at) VALUES (?, ?, ?, ?, ?)',
        [identifier, code, channel, type, expiresAt]
    );
}

/**
 * Verifikasi OTP dari database.
 * Menghapus record setelah berhasil diverifikasi (single-use).
 */
async function verifyOtp(identifier, code, channel, type = 'REGISTRATION') {
    const [rows] = await db.query(
        `SELECT id FROM verification_codes
         WHERE identifier = ? AND code = ? AND channel = ? AND type = ? AND expires_at > NOW()`,
        [identifier, code, channel, type]
    );

    if (rows.length === 0) {
        const err = new Error('Kode OTP tidak valid atau sudah kadaluarsa.');
        err.statusCode = 400;
        throw err;
    }

    await db.query('DELETE FROM verification_codes WHERE id = ?', [rows[0].id]);
    return true;
}

// ─── Pengirim OTP ─────────────────────────────────────────────────────────────

/**
 * Kirim OTP via Email (Gmail SMTP)
 */
async function sendOtpEmail(email, name, code) {
    const mailOptions = {
        from: `"Food AI Rescue" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Kode OTP Registrasi - Food AI Rescue',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
                            padding: 24px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">🌿 Food AI Rescue</h1>
                    <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.85;">Selamatkan Makanan, Selamatkan Bumi</p>
                </div>
                <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #333; margin-top: 0;">Halo, ${name}!</h2>
                    <p style="color: #555; line-height: 1.7;">
                        Terima kasih telah mendaftar di <strong>Food AI Rescue</strong>.
                        Gunakan kode OTP berikut untuk menyelesaikan pendaftaran Anda:
                    </p>
                    <div style="background: white; border: 2px dashed #ea580c; padding: 24px;
                                text-align: center; margin: 24px 0; border-radius: 10px;">
                        <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
                            Kode OTP Anda
                        </p>
                        <p style="margin: 12px 0 0; font-size: 38px; font-weight: bold;
                                  color: #ea580c; letter-spacing: 8px;">
                            ${code}
                        </p>
                    </div>
                    <p style="color: #777; font-size: 13px;">
                        ⏱ Kode berlaku selama <strong>15 menit</strong>.<br>
                        🔒 Jangan bagikan kode ini kepada siapa pun.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
                    <p style="color: #aaa; font-size: 11px; margin: 0;">
                        Jika Anda tidak melakukan pendaftaran ini, abaikan email ini.
                    </p>
                </div>
            </div>
        `,
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`[OTP-EMAIL] Kode terkirim ke ${email}`);
}

// ─── Fungsi Utama ─────────────────────────────────────────────────────────────

/**
 * Kirim OTP ke channel yang dipilih user.
 *
 * @param {'email'|'whatsapp'} channel
 * @param {{ email: string, phone: string, name: string }} userData
 * @returns {{ identifier: string, channel: string }}
 */
async function sendRegistrationOtp(channel, userData) {
    const { email, phone, name } = userData;
    const code = generateOtpCode();

    if (channel === 'email') {
        if (!email) throw Object.assign(
            new Error('Email harus diisi untuk verifikasi via email.'),
            { statusCode: 400 }
        );
        await saveOtp(email, code, 'email', 'REGISTRATION');
        await sendOtpEmail(email, name || 'Pengguna', code);
        return { identifier: email, channel: 'email' };
    }

    if (channel === 'whatsapp') {
        if (!phone) throw Object.assign(
            new Error('Nomor telepon harus diisi untuk verifikasi via WhatsApp.'),
            { statusCode: 400 }
        );
        const normalized = normalizePhone(phone);
        await saveOtp(normalized, code, 'whatsapp', 'REGISTRATION');
        await sendOtpWhatsApp(phone, name || 'Pengguna', code);
        return { identifier: normalized, channel: 'whatsapp' };
    }

    throw Object.assign(
        new Error(`Channel tidak valid: "${channel}". Pilih 'email' atau 'whatsapp'.`),
        { statusCode: 400 }
    );
}

/**
 * Verifikasi OTP yang dimasukkan user.
 *
 * @param {string} identifier - email atau nomor telepon (E.164)
 * @param {string} code
 * @param {'email'|'whatsapp'} channel
 */
async function verifyRegistrationOtp(identifier, code, channel) {
    const normalizedId = channel === 'whatsapp'
        ? normalizePhone(identifier)
        : identifier;

    return verifyOtp(normalizedId, code, channel, 'REGISTRATION');
}

module.exports = {
    generateOtpCode,
    normalizePhone,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    saveOtp,
    verifyOtp,
    sendOtpEmail,
    sendOtpWhatsApp,
};
