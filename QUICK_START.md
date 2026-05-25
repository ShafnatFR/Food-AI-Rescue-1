# Quick Start - Sistem Autentikasi Modern

## Status: ✅ Siap Digunakan

Sistem autentikasi modern dengan email verification dan password reset telah berhasil diimplementasikan dan di-setup.

---

## Langkah-Langkah Cepat

### 1. Konfigurasi Email (PENTING!)

Edit file `.env` di root project:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Cara mendapatkan App Password Gmail:**
1. Buka https://myaccount.google.com/security
2. Aktifkan "2-Step Verification" jika belum
3. Buka https://myaccount.google.com/apppasswords
4. Pilih "Mail" dan "Windows Computer"
5. Copy app password yang digenerate
6. Paste ke `.env`

### 2. Jalankan Server

```bash
cd server
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### 3. Jalankan Frontend (Terminal baru)

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

---

## Testing Fitur

### Test 1: Registrasi dengan Email Verification

1. Buka http://localhost:3000
2. Klik "Daftar di sini"
3. Isi form:
   - Nama: John Doe
   - Email: your-email@gmail.com
   - Password: SecurePass123
   - Confirm Password: SecurePass123
   - Role: Pendonor Individu
4. Klik "Lanjutkan"
5. Cek email Anda untuk kode verifikasi 6 digit
6. Masukkan kode di halaman verifikasi
7. ✅ Akun berhasil dibuat!

### Test 2: Login

1. Kembali ke halaman login
2. Masukkan email dan password yang baru didaftar
3. Klik "Masuk"
4. ✅ Berhasil login! User data ditampilkan

### Test 3: Forgot Password

1. Di halaman login, klik "Lupa password?"
2. Masukkan email yang terdaftar
3. Klik "Kirim Link Reset"
4. Cek email untuk token reset
5. Masukkan token dan password baru
6. Klik "Reset Password"
7. ✅ Password berhasil direset!

---

## File-File Baru yang Ditambahkan

### Backend
- `server/services/emailService.js` - Email & verification logic
- `server/migrations/001_add_email_verification.sql` - Database migration
- `server/runMigration.js` - Script untuk menjalankan migration

### Frontend
- `components/RegisterPage.tsx` - Halaman registrasi
- `components/LoginPage.tsx` - Halaman login
- `components/ForgotPasswordPage.tsx` - Halaman reset password
- `AuthContext.tsx` - Updated dengan user data management

### Dokumentasi
- `AUTHENTICATION_SETUP.md` - Setup lengkap & API documentation
- `QUICK_START.md` - File ini

### Database
- Tabel `email_verifications` - Menyimpan kode verifikasi
- Tabel `password_resets` - Menyimpan token reset password
- Kolom baru di `users`: `last_login_at`, `email_verified_at`

---

## Fitur Utama

✅ **Email Verification**
- Kode 6 digit dikirim ke email
- Expire dalam 15 menit
- Validasi sebelum akun dibuat

✅ **Secure Password**
- Password di-hash dengan bcryptjs
- Minimum 8 karakter
- Confirm password validation

✅ **Password Reset**
- Token-based reset via email
- Token expire dalam 1 jam
- Secure password update

✅ **Session Management**
- User data disimpan di localStorage
- Remember me option
- Auto logout

✅ **Modern UI**
- Responsive design
- Gradient backgrounds
- Loading states
- Error handling

---

## API Endpoints

Semua endpoint menggunakan POST ke `http://localhost:5000/api`

| Action | Deskripsi |
|--------|-----------|
| `SEND_VERIFICATION_EMAIL` | Kirim kode verifikasi |
| `VERIFY_EMAIL_CODE` | Verifikasi kode email |
| `REGISTER_USER` | Daftar user baru |
| `LOGIN_USER` | Login user |
| `REQUEST_PASSWORD_RESET` | Request reset password |
| `RESET_PASSWORD` | Reset password dengan token |

Lihat `AUTHENTICATION_SETUP.md` untuk detail lengkap setiap endpoint.

---

## Troubleshooting

### Email tidak terkirim
```
❌ Error: Gagal mengirim email verifikasi
```
**Solusi:**
- Cek EMAIL_USER dan EMAIL_PASSWORD di .env
- Pastikan 2FA sudah diaktifkan di Google
- Pastikan App Password sudah di-generate

### Database error
```
❌ Error: Pool belum siap
```
**Solusi:**
- Pastikan MySQL sudah running
- Jalankan `node runMigration.js` di folder server
- Cek DB_HOST, DB_USER, DB_PASSWORD di .env

### CORS error
```
❌ Error: Access to XMLHttpRequest blocked by CORS
```
**Solusi:**
- Pastikan backend berjalan di http://localhost:5000
- Pastikan frontend berjalan di http://localhost:3000
- CORS sudah dikonfigurasi di Express

---

## Integrasi ke App.tsx

Untuk mengintegrasikan ke aplikasi utama, update `App.tsx`:

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
          onLoginSuccess={() => window.location.href = '/dashboard'}
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

---

## Next Steps

1. **Konfigurasi Email** - Update EMAIL_USER dan EMAIL_PASSWORD di .env
2. **Test Semua Fitur** - Ikuti Testing Fitur di atas
3. **Integrasi ke App** - Update App.tsx dengan AuthFlow
4. **Customize UI** - Sesuaikan warna dan styling
5. **Add Protected Routes** - Tambahkan route protection untuk dashboard
6. **Setup 2FA** - Tambahkan two-factor authentication (opsional)

---

## Support

Untuk pertanyaan atau masalah, lihat `AUTHENTICATION_SETUP.md` untuk dokumentasi lengkap.

Selamat! Sistem autentikasi modern Anda sudah siap digunakan! 🎉
