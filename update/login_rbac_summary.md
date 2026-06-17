# Proses Login dan RBAC (Role-Based Access Control) di Food AI Rescue

Proses utama autentikasi dan penentuan hak akses (RBAC) dalam proyek ini diatur di dalam komponen utama aplikasi, yaitu `App.tsx`. Aplikasi ini menggunakan *state* internal dan `localStorage`/`sessionStorage` untuk menyimpan sesi pengguna.

Berikut adalah potongan kode utama dan alur kerjanya:

## 1. Pengecekan Sesi (Session Check) saat Aplikasi Dimuat
Saat aplikasi pertama kali dimuat, sistem akan memeriksa apakah ada sesi yang tersimpan di `localStorage` (jika menggunakan fitur "Remember Me") atau `sessionStorage`.

```tsx
// App.tsx
useEffect(() => {
  const checkSession = async () => {
      // Cek Local Storage atau Session Storage
      const savedSession = localStorage.getItem('far_session') || sessionStorage.getItem('far_session');
      
      if (savedSession) {
          try {
              const parsedUser = JSON.parse(savedSession);
              setRole(parsedUser.role);
              setCurrentUser(parsedUser);
              setCurrentView('dashboard');

              // RE-FETCH FRESH DATA (Update status terbaru dari database lokal/server)
              const freshUser = await db.getUser(parsedUser.id);
              if (freshUser) {
                  setCurrentUser(freshUser);
                  setRole(freshUser.role);
                  const freshSession = JSON.stringify(freshUser);
                  if (localStorage.getItem('far_session')) localStorage.setItem('far_session', freshSession);
                  else sessionStorage.setItem('far_session', freshSession);
              }
          } catch (e) {
              console.error("Session re-verification error", e);
          }
      }
  };
  checkSession();
}, []);
```
**Alur Kerja**: Aplikasi mengambil data `far_session`. Jika ditemukan, *state* `role` dan `currentUser` langsung diatur sehingga pengguna bisa langsung masuk tanpa layar *loading* panjang. Sistem kemudian secara latar belakang memperbarui data *(re-fetch)* dari basis data untuk memastikan status akun terbaru (misalnya, memastikan akun tidak di-*suspend* atau dinonaktifkan di sesi lain).

## 2. Fungsi Login Utama
Ketika pengguna berhasil melakukan login dari antarmuka (atau *register* yang otomatis memicu login), fungsi `handleLogin` akan dipanggil.

```tsx
// App.tsx
const handleLogin = (data: Partial<UserData> & { role: UserRole; email?: string }, remember: boolean = false) => {
    setRole(data.role); // Mengatur hak akses
    
    // ... inisialisasi data pengguna default jika kosong ...
    const userObject: UserData = {
        id: data.id || '1',
        name: finalName,
        email: data.email || 'user@foodairescue.com',
        role: data.role || 'recipient',
        status: (data.status as any) || 'active',
        // ...
    };

    setCurrentUser(userObject);
    
    // PERSIST SESSION
    const sessionString = JSON.stringify(userObject);
    if (remember) {
        localStorage.setItem('far_session', sessionString);
    } else {
        sessionStorage.setItem('far_session', sessionString);
    }

    setCurrentView('dashboard'); // Arahkan pengguna ke tampilan dashboard
};
```
**Alur Kerja**: Data dari respons login digunakan untuk membuat objek pengguna utuh. Sesi kemudian disimpan ke penyimpanan peramban (*browser storage*) berdasarkan parameter `remember`. State reaktif lalu memperbarui aplikasi untuk menampilkan `dashboard`.

## 3. Penentuan Akses Berdasarkan Peran (RBAC)
Penentuan halaman (atau lebih tepatnya komponen) mana yang berhak diakses oleh pengguna dilakukan di fungsi `renderContent()`. Setiap *role* memiliki *Index Component* masing-masing.

```tsx
// App.tsx
const renderContent = () => {
    // ... Penanganan tampilan non-auth (landing, login, register, dll) ...

    // 1. CHECK ACCOUNT STATUS (Pemeriksaan Status Akun)
    if (currentUser && role !== 'admin' && role !== 'super_admin') {
        if (currentUser.status?.toUpperCase() === 'SUSPENDED') {
            return <VerificationRejectedModal onLogout={handleLogout} userName={currentUser.name} />;
        }
        if (currentUser.status?.toUpperCase() === 'PENDING') {
            return <VerificationPendingModal onLogout={handleLogout} onRefresh={() => fetchData(true)} userName={currentUser.name} />;
        }
    }

    // 2. RBAC: Donor (Provider / Penyedia Makanan)
    if (role === 'individual_donor' || role === 'corporate_donor') {
        // Me-render komponen dashboard penyedia donasi dan manajemen inventaris
        return <ProviderIndex {...props} />;
    }

    // 3. RBAC: Penerima (Recipient)
    if (role?.toLowerCase() === 'recipient') {
        // Me-render komponen untuk melihat makanan tersedia dan mengklaim makanan
        return <ReceiverIndex {...props} />;
    }

    // 4. RBAC: Relawan (Volunteer)
    if (role === 'volunteer') {
        // Me-render komponen untuk mengantar/menerima misi distribusi
        return <VolunteerIndex {...props} />;
    }

    // 5. RBAC: Admin
    if (role === 'admin' || role === 'super_admin') {
        // Me-render dashboard kontrol keseluruhan
        return <AdminIndex {...props} />;
    }

    return <div>Unknown Role</div>;
};
```
**Alur Kerja**: 
- Sebelum me-render *dashboard*, aplikasi memeriksa *status akun* (kecuali untuk admin). Pengguna dengan status `PENDING` atau `SUSPENDED` hanya akan melihat *modal* peringatan tanpa bisa masuk ke aplikasi inti.
- Jika lolos verifikasi status, percabangan *if* akan mendeteksi `role` aktif dari *state*. 
- Sistem membatasi hak akses dengan me-render komponen khusus untuk setiap peran (misalnya: `ProviderIndex`, `ReceiverIndex`), yang membungkus keseluruhan fitur yang hanya relevan dan diizinkan untuk peran tersebut.
