# Kalkulasi Gamifikasi dan SROI (Social Return on Investment)

Sistem *Food AI Rescue* menerapkan gamifikasi untuk mendorong keterlibatan relawan dan menyajikan Dasbor Dampak Sosial (SROI) yang mengukur pencegahan emisi karbon dari setiap porsi makanan yang terselamatkan.

Berikut adalah utilitas utama yang mengatur logika tersebut:

## 1. Gamifikasi: Penambahan Poin / XP Relawan

Setiap kali pengguna (terutama relawan) menyelesaikan misi pengantaran, sistem memanggil fungsi `addPoints` di *backend* untuk memperbarui skor, mencatat riwayat poin, dan mengirimkan notifikasi pencapaian.

```javascript
// server/index.js
// --- HELPER: Gamified Points System ---
async function addPoints(userId, amount, activityType, referenceId = null) {
    if (!userId || amount === 0) return;
    
    console.log(`[POINTS] Adding ${amount} to UserID: ${userId} (${activityType})`);
    
    // 1. Tambahkan total poin ke tabel users utama
    await db.query('UPDATE users SET points = points + ? WHERE id = ?', [amount, userId]);
    
    // 2. Simpan jejak histori perolehan poin (Log Activity)
    await db.query(
        'INSERT INTO point_histories (user_id, amount, activity_type, reference_id) VALUES (?, ?, ?, ?)',
        [userId, amount, activityType, referenceId]
    );

    // 3. Kirim Notifikasi Pencapaian / Achievement
    const notifMsg = `Selamat! Anda baru saja mendapatkan ${amount} poin dari ${activityType}.`;
    await db.query(
        'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
        [userId, 'Poin Bertambah!', notifMsg, 'achievement', 0]
    );
    
    return { success: true, pointsAdded: amount };
}

// ... CONTOH PEMANGGILAN KETIKA MISI SELESAI ...
// await addPoints(scannerId, 150, 'QR Handover - Serah Terima Makanan', claim.id);
```

**Cara Kerja Gamifikasi**:
Fungsi ini bersifat terpusat (*helper function*). Saat pesanan berstatus *completed* (QR divalidasi), poin yang didapat akan langsung dijumlahkan ke saldo `points` relawan. Akumulasi poin ini nantinya menentukan "Peringkat/Level" (*Rank*) mereka secara dinamis di antarmuka *(Leaderboard)*.

---

## 2. Kalkulasi Dampak Sosial SROI (Jejak Karbon / CO2)

Sistem menggunakan pendekatan Life Cycle Assessment (LCA) sederhana. Saat makanan diunggah, AI menghitung *baseline* emisi (`co2_per_portion`) berdasarkan bahan, berat, dan jenis makanan, lalu menyimpannya ke tabel `social_impacts`. 

Ketika admin membuka dasbor SROI, sistem akan menghitung seberapa banyak makanan (kuantitas) yang benar-benar berhasil diselamatkan (berstatus `COMPLETED`), dan mengalikannya dengan *baseline* CO2 makanan tersebut.

```javascript
// server/index.js
async function getAdminDashboard() {
    // 1. Agregasi Dampak Nyata (SROI) dari Klaim yang telah SELESAI
    const [impactRows] = await db.query(`
        SELECT 
            /* Rumus Konversi Berat Dasar */
            COALESCE(SUM(si.co2_per_portion * c.claimed_quantity * 0.45), 0) as totalSavedKg,
            
            /* RUMUS SROI: CO2 Per Porsi * Kuantitas Terselamatkan */
            COALESCE(SUM(si.co2_per_portion * c.claimed_quantity), 0) as totalCo2Saved,
            
            /* Metrik SROI Lainnya */
            COUNT(DISTINCT c.receiver_id) as uniqueBeneficiaries,
            COUNT(c.id) as completedClaims
            
        FROM claims c
        JOIN food_items f ON c.food_id = f.id
        LEFT JOIN social_impacts si ON f.id = si.food_id
        
        /* HANYA MENGHITUNG MAKANAN YANG BENAR-BENAR BERHASIL DISEBARKAN */
        WHERE c.status = 'COMPLETED'
    `);
    
    const impact = impactRows[0] || {};
    // ...
}
```

**Cara Kerja SROI & Karbon**:
1. **Fase Input**: AI Gemini menghitung proyeksi emisi (`co2_per_portion`) misal: 2.5 kg CO2 per porsi Daging Rendang. Nilai ini di-*insert* ke tabel `social_impacts`.
2. **Fase Agregasi (Query SQL di atas)**: Untuk Dasbor SROI nyata, sistem *tidak* menghitung makanan yang baru diposting, *melainkan* memfilter tabel klaim (`claims c`) yang statusnya sudah mutlak `'COMPLETED'`.
3. **Kalkulasi**: Nilai metrik CO2 porsi dasar dikalikan (`*`) dengan `c.claimed_quantity` (jumlah porsi yang diambil).
4. Hasil `totalCo2Saved` kemudian dimunculkan di metrik dasbor. Seringkali aplikasi mengubah visualnya menjadi bentuk ekuivalensi, misalnya `"Sama dengan menanam ~X Pohon"` (dengan membagi `totalCo2Saved / 20 kg`).
