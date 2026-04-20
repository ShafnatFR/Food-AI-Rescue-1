# 🥗 FoodAI Rescue (FAR)

FoodAI Rescue (FAR) adalah platform revolusioner untuk manajemen donasi makanan yang menggunakan kecerdasan buatan (Google Gemini AI) untuk memverifikasi kelayakan makanan secara *real-time* dan melacak jangkauan dampak sosial, sekaligus mencegah pemborosan makanan (Food Waste).

Proyek ini telah dikembangkan menjadi *platform* berskala penuh dengan antarmuka pengguna premium bergaya kaca (*Glassmorphism*) dan gradien dinamis, rute *Roadmap* visual interaktif khusus, mode pemeliharaan, serta sistem gamifikasi untuk memacu semangat kerelawanan. 🚀

---

## ✨ Fitur-Fitur Utama Terbaru

- 🌟 **Landing Page Premium & Interaktif**: Alur navigasi menggunakan pendaran *cursor follower*, dan efek gulirisasi *Roadmap* untuk membimbing donatur baru.
- 🤖 **Verifikasi Makanan Oleh AI**: Sistem dapat mendeteksi kelayakan makanan, kehalalan visual, kemasan ekologis, lalu menyeleksi foto tidak relevan dan berbahaya.
- 🎮 **Gamifikasi Sosial (Ranks & Badges)**: Pencapaian secara bertahap bagi pengguna (dari Donatur Pemula hingga Sultan Donasi) berdasarkan poin dan aksi penyelamatan rutin.
- 🛠️ **Sistem Administratif Tingkat Lanjut**: Dilengkapi **Maintenance Mode**, *Content CMS* mandiri, serta pengaturan skema AI langsung dari dashboard Admin.
- 🎨 **Antarmuka Ultra-Modern**: Animasi transisi antar-halaman (*perspective-view*) serta latar belakang organik berupa *mesh gradients*.

---

## 🚀 Panduan Menjalankan Aplikasi Secara Lokal

Ikuti langkah-langkah di bawah ini untuk mengatur dan menjalankan FoodAI Rescue pada mesin lokal Anda (Windows/Mac/Linux).

### Langkah 1: Prasyarat (Tools Dasar)
Pastikan beberapa *software* berikut telah terinstal:
1. **Node.js** (Rekomendasi: Versi 18 atau 20+ LTS).
2. **Server Lokal MySQL**: Instal **XAMPP** atau **Laragon**.
3. **Git** untuk kloning repositori.

### Langkah 2: Menyiapkan Database via XAMPP / Laragon
1. Nyalakan layanan **Apache** dan **MySQL** dari Panel Kontrol XAMPP atau jalankan Laragon.
2. Buka klien database Anda (misalnya: *phpMyAdmin*, DBeaver, atau HeidiSQL).
3. Buat database baru. Anda dapat menamainya `foodairescue`.
4. Di dalam proyek ini, seluruh **skema struktur database beserta data awal (dummy data & settings)** telah digabungkan menjadi satu file.
5. Lakukan **Import** file `server/foodairescue.sql` secara langsung ke dalam database `foodairescue` milik Anda.
   > *(Catatan: File ini sudah memuat akun-akun pengguna percobaan lengkap dengan riwayat log dan target sistem terbaru, sehingga Anda bisa langsung menguji seluruh fitur aplikasinya!)*

### Langkah 3: Konfigurasi File *Environment* (.env)
Aplikasi membutuhkan konfigurasi kredensial (seperti *password* database dan *API Key* Google Gemini). Di lokasi **root folder** proyek Anda, pastikan terdapat file bernama `.env` (buat baru jika belum ada), lalu isi konfigurasi ini:

```env
# Server Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=foodairescue
PORT=5000

# Google Gemini API Key (Diharuskan untuk verifikasi makanan!)
VITE_GEMINI_API_KEY=AIzaSy_KODE_ANDA_DISINI
```
> **Catatan:** Ganti nilai `DB_PASSWORD` jika MySQL XAMPP/Laragon Anda menggunakan sandi. Jangan lupa ganti `VITE_GEMINI_API_KEY` menggunakan *Google API Key* aktif milik Anda.

### Langkah 4: Instalasi Dependensi Terkait
Proyek ini terbagi atas sisi antarmuka (*Client*) dan sisi belakang (*Server*).

1. Buka terminal Anda pada folder utama (root) proyek proyek dan ketik:
   ```bash
   npm install
   ```
2. Kemudian, berpindah sementara ke folder `server` menggunakan perintah `cd server` dan jalankan hal serupa:
   ```bash
   npm install
   ```

### Langkah 5: Jalankan Aplikasi Secara Serentak!
Untuk melihat dan menguji aplikasinya, Anda perlu "menghidupkan" kedua belah ruang (*Backend* dan *Frontend*). Anda **membutuhkan dua tab terminal / command prompt**.

**Terminal 1 (Untuk Menghidupkan Backend/Database)**
```bash
cd server
npm run dev
```
> Hal ini akan memberitahukan ke sistem Node.js agar menyalakan API lokal (`localhost:5000`).

**Terminal 2 (Untuk Menghidupkan Frontend/Vite)**  
*(Pastikan Anda berada di Root folder proyek tempat README ini juga berada)*
```bash
npm run dev
```
> Proses vite akan beranjak jalan. 

---
🎉 **Berhasil!** Sekarang buka Web Browser kesayangan Anda lalu kunjungilah `http://localhost:5173`. Aplikasi Anda telah sepenuhnya aktif dan menyala!

---

## 👥 Hak Akses (Role List) Di Dalam Sistem FAR:
Sistem memiliki pengaturan hirarki unik dengan pemisah dashboard yang berbeda untuk 5 wewenang.

1. **Donatur (Individual & Corporate)**: Bisa mendonasikan barang-barang pangan dan memperoleh laporan efisiensi pelestarian bumi (menghemat CO² & Air tanah). 
2. **Penerima (Receiver)**: Terdiri dari Panti Asuhan hingga Keluarga; mampu memesan atau meng-klaim donasi makanan yang tersedia di area sekitarnya serta mengurus pickup/kurir relawan.
3. **Relawan (Volunteer)**: Pahlawan di garda depan! Membaca permintaan dari Donor -> Penerima, menuju jalan, merekan foto penyelesaian menggunakan Scan QR khusus, lalu mendapatkan bayaran *points* & medali ranking sosial.
4. **Admin**: Mengelola komunitas, meninjau komplain barang basi/menghilang (*support request*), menyesuaikan parameter gamifikasi serta kunci rahasia API (sebagai jembatan penyambung nyala *Gemini*).
5. **SuperAdmin**: Akses mutlak terhadap segala isi aplikasi termasuk konfigurasi Maintenance Darurat / pengangkatan Admin baru.
