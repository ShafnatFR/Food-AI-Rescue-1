const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../db');

// Konfigurasi email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
});

/**
 * Generate kode verifikasi 6 digit
 */
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Kirim email verifikasi ke user baru
 */
async function sendVerificationEmail(email, name, verificationCode) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@foodairescue.id',
            to: email,
            subject: 'Verifikasi Email - Food AI Rescue',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">Food AI Rescue</h1>
                        <p style="margin: 5px 0 0 0;">Selamatkan Makanan, Selamatkan Bumi</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #333; margin-top: 0;">Halo ${name}!</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Terima kasih telah mendaftar di Food AI Rescue. Untuk menyelesaikan pendaftaran Anda, 
                            silakan verifikasi email dengan memasukkan kode di bawah ini:
                        </p>
                        <div style="background: white; border: 2px dashed #ea580c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                            <p style="margin: 0; font-size: 12px; color: #999;">Kode Verifikasi</p>
                            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #ea580c; letter-spacing: 5px;">
                                ${verificationCode}
                            </p>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            Kode ini berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapa pun.
                        </p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            Jika Anda tidak melakukan pendaftaran ini, abaikan email ini.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Verification email sent to ${email}`);
        return true;
    } catch (error) {
        console.error(`[EMAIL ERROR] Failed to send verification email to ${email}:`, error);
        throw new Error('Gagal mengirim email verifikasi. Silakan coba lagi.');
    }
}

/**
 * Kirim email reset password
 */
async function sendPasswordResetEmail(email, name, resetToken) {
    try {
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@foodairescue.id',
            to: email,
            subject: 'Reset Password - Food AI Rescue',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">Food AI Rescue</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #333; margin-top: 0;">Reset Password</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Kami menerima permintaan untuk mereset password akun Anda. 
                            Klik tombol di bawah untuk membuat password baru:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Password reset email sent to ${email}`);
        return true;
    } catch (error) {
        console.error(`[EMAIL ERROR] Failed to send password reset email to ${email}:`, error);
        throw new Error('Gagal mengirim email reset password.');
    }
}

/**
 * Simpan kode verifikasi ke database
 */
async function saveVerificationCode(email, code) {
    try {
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit
        
        // Hapus kode lama jika ada
        await db.query('DELETE FROM email_verifications WHERE email = ?', [email]);
        
        // Simpan kode baru
        await db.query(
            'INSERT INTO email_verifications (email, code, expires_at) VALUES (?, ?, ?)',
            [email, code, expiresAt]
        );
        
        return true;
    } catch (error) {
        console.error('[DB ERROR] Failed to save verification code:', error);
        throw error;
    }
}

/**
 * Verifikasi kode yang dikirim user
 */
async function verifyCode(email, code) {
    try {
        const [rows] = await db.query(
            'SELECT * FROM email_verifications WHERE email = ? AND code = ? AND expires_at > NOW()',
            [email, code]
        );

        if (rows.length === 0) {
            const err = new Error('Kode verifikasi tidak valid atau sudah kadaluarsa.');
            err.statusCode = 400;
            throw err;
        }

        // Hapus kode setelah digunakan
        await db.query('DELETE FROM email_verifications WHERE email = ?', [email]);
        
        return true;
    } catch (error) {
        if (error.statusCode) throw error;
        console.error('[DB ERROR] Failed to verify code:', error);
        throw error;
    }
}

/**
 * Generate reset token
 */
function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Simpan reset token
 */
async function saveResetToken(userId, token) {
    try {
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
        
        await db.query(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, token, expiresAt]
        );
        
        return true;
    } catch (error) {
        console.error('[DB ERROR] Failed to save reset token:', error);
        throw error;
    }
}

/**
 * Verifikasi reset token
 */
async function verifyResetToken(token) {
    try {
        const [rows] = await db.query(
            'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (rows.length === 0) {
            const err = new Error('Token reset tidak valid atau sudah kadaluarsa.');
            err.statusCode = 400;
            throw err;
        }

        return rows[0];
    } catch (error) {
        if (error.statusCode) throw error;
        console.error('[DB ERROR] Failed to verify reset token:', error);
        throw error;
    }
}

module.exports = {
    generateVerificationCode,
    sendVerificationEmail,
    sendPasswordResetEmail,
    saveVerificationCode,
    verifyCode,
    generateResetToken,
    saveResetToken,
    verifyResetToken
};
