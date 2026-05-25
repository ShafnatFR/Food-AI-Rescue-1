# Sistem Autentikasi Modern - Food AI Rescue

## Ringkasan

Sistem autentikasi modern dengan email verification dan password reset telah diimplementasikan. Sistem ini menggunakan:

- **Email Verification**: Kode 6 digit yang dikirim ke email user
- **Password Hashing**: bcryptjs untuk keamanan password
- **Password Reset**: Token-based password reset via email
- **Session Management**: localStorage untuk menyimpan user data
- **Modern UI**: React components dengan Tailwind CSS

---

## Fitur Utama

### 1. Registrasi dengan Email Verification
- User mengisi form registrasi (nama, email, password, role, phone)
- Sistem mengirim kode verifikasi 6 digit ke email
- User memasukkan kode untuk memverifikasi email
- Akun dibuat setelah verifikasi berhasil

### 2. Login
- User login dengan email dan password
- Password di-hash menggunakan bcryptjs
- User data disimpan di localStorage
- Support "Remember Me" untuk menyimpan email

### 3. Forgot Password
- User memasukkan email untuk reset password
- Sistem mengirim token reset ke email
- User memasukkan token dan password baru
- Password di-update di database

---

## Setup & Instalasi

### Backend Setup

#### 1. Install Dependencies
```bash
cd server
npm install
```

#### 2. Konfigurasi Email (Gmail)

**Langkah-langkah:**

1. Buka https://myaccount.google.com/security
2. Aktifkan "2-Step Verification"
3. Buka https://myaccount.google.com/apppasswords
4. Pilih "Mail" dan "Windows Computer"
5. Copy app password yang digenerate
6. Update `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### 3. Setup Database

Jalankan migration untuk membuat tabel baru:

```bash
# Dari folder server
mysql -u root -p foodairescue < migrations/001_add_email_verification.sql
```

Atau manual di MySQL:
```sql
-- Buat tabel email_verifications
CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Buat tabel password_resets
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tambah kolom ke users table
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `last_login_at` timestamp NULL DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `email_verified_at` timestamp NULL DEFAULT NULL;
```

#### 4. Jalankan Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

---

### Frontend Setup

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Update App.tsx

Integrasikan komponen autentikasi ke App.tsx:

```tsx
import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';

function AuthFlow() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'forgot'>('login');
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">Selamat Datang, {user.name}!</h1>
            <p className="text-gray-600 mb-4">Email: {user.email}</p>
            <p className="text-gray-600 mb-4">Role: {user.role}</p>
            <p className="text-gray-600 mb-4">Points: {user.points}</p>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage
          onLoginSuccess={() => {
            // Redirect ke dashboard
            window.location.href = '/dashboard';
          }}
          onSwitchToRegister={() => setCurrentPage('register')}
          onSwitchToForgotPassword={() => setCurrentPage('forgot')}
        />
      )}
      {currentPage === 'register' && (
        <RegisterPage
          onRegisterSuccess={() => setCurrentPage('login')}
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      )}
      {currentPage === 'forgot' && (
        <ForgotPasswordPage
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthFlow />
    </AuthProvider>
  );
}

export default App;
```

#### 3. Jalankan Frontend
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

---

## API Endpoints

### 1. Send Verification Email
**POST** `/api`

```json
{
  "action": "SEND_VERIFICATION_EMAIL",
  "data": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "message": "Kode verifikasi telah dikirim ke email Anda.",
    "email": "user@example.com"
  }
}
```

### 2. Verify Email Code
**POST** `/api`

```json
{
  "action": "VERIFY_EMAIL_CODE",
  "data": {
    "email": "user@example.com",
    "code": "123456"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "message": "Email berhasil diverifikasi. Silakan lanjutkan pendaftaran.",
    "email": "user@example.com"
  }
}
```

### 3. Register User
**POST** `/api`

```json
{
  "action": "REGISTER_USER",
  "data": {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "SecurePassword123",
    "phone": "08123456789",
    "role": "individual_donor"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "individual_donor",
    "status": "pending",
    "points": 0,
    "isNewUser": true
  }
}
```

### 4. Login User
**POST** `/api`

```json
{
  "action": "LOGIN_USER",
  "data": {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "individual_donor",
    "phone": "08123456789",
    "points": 0,
    "status": "active",
    "last_login_at": "2026-05-25T12:50:44.000Z"
  }
}
```

### 5. Request Password Reset
**POST** `/api`

```json
{
  "action": "REQUEST_PASSWORD_RESET",
  "data": {
    "email": "user@example.com"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "message": "Link reset password telah dikirim ke email Anda."
  }
}
```

### 6. Reset Password
**POST** `/api`

```json
{
  "action": "RESET_PASSWORD",
  "data": {
    "token": "abc123def456...",
    "newPassword": "NewSecurePassword123"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "message": "Password berhasil direset. Silakan login dengan password baru Anda."
  }
}
```

---

## File Structure

```
Food-AI-Rescue-1-1/
├── server/
│   ├── services/
│   │   └── emailService.js          (Email & verification logic)
│   ├── migrations/
│   │   └── 001_add_email_verification.sql
│   ├── index.js                     (Updated dengan auth endpoints)
│   └── package.json                 (Updated dengan jsonwebtoken)
├── components/
│   ├── RegisterPage.tsx             (Registrasi dengan email verification)
│   ├── LoginPage.tsx                (Login page)
│   └── ForgotPasswordPage.tsx        (Password reset)
├── AuthContext.tsx                  (Updated dengan user data)
└── .env                             (Updated dengan email config)
```

---

## Security Features

1. **Password Hashing**: Menggunakan bcryptjs dengan salt rounds 10
2. **Email Verification**: Kode 6 digit yang expire dalam 15 menit
3. **Password Reset Token**: Token random yang expire dalam 1 jam
4. **CORS Protection**: Configured di Express
5. **Input Validation**: Validasi email format dan password strength
6. **SQL Injection Prevention**: Menggunakan parameterized queries
7. **Secure Password Storage**: Plain text passwords di-hash sebelum disimpan

---

## Testing

### Test Registrasi
1. Buka http://localhost:3000
2. Klik "Daftar di sini"
3. Isi form dengan data valid
4. Klik "Lanjutkan"
5. Cek email untuk kode verifikasi
6. Masukkan kode verifikasi
7. Akun berhasil dibuat

### Test Login
1. Buka http://localhost:3000
2. Masukkan email dan password
3. Klik "Masuk"
4. Berhasil login dan redirect ke dashboard

### Test Forgot Password
1. Buka http://localhost:3000
2. Klik "Lupa password?"
3. Masukkan email
4. Klik "Kirim Link Reset"
5. Cek email untuk token reset
6. Masukkan token dan password baru
7. Password berhasil direset

---

## Troubleshooting

### Email tidak terkirim
- Pastikan EMAIL_USER dan EMAIL_PASSWORD sudah benar di .env
- Pastikan 2-Factor Authentication sudah diaktifkan di Google
- Pastikan App Password sudah di-generate dengan benar
- Cek console server untuk error messages

### Database error
- Pastikan MySQL sudah running
- Pastikan database `foodairescue` sudah dibuat
- Jalankan migration SQL untuk membuat tabel baru

### CORS error
- Pastikan backend berjalan di http://localhost:5000
- Pastikan frontend berjalan di http://localhost:3000
- CORS sudah dikonfigurasi di Express

### Token expired
- Email verification code expire dalam 15 menit
- Password reset token expire dalam 1 jam
- User perlu request ulang jika token sudah expired

---

## Next Steps

1. **Integrasi dengan Dashboard**: Tambahkan protected routes untuk dashboard
2. **Email Templates**: Customize email templates sesuai brand
3. **Two-Factor Authentication**: Tambahkan 2FA untuk keamanan ekstra
4. **Social Login**: Integrasi dengan Google/Facebook login
5. **Rate Limiting**: Tambahkan rate limiting untuk prevent brute force
6. **Audit Logging**: Log semua aktivitas autentikasi

---

## Support

Untuk pertanyaan atau masalah, silakan hubungi tim development.
