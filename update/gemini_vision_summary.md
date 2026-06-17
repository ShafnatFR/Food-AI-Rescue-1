# Fitur Verifikasi Keamanan Makanan dengan Google Gemini Vision

Fitur verifikasi makanan menggunakan AI pada proyek ini diurus oleh `verifyFood` yang memanggil utilitas *rotasi API key* untuk Gemini. 

## 1. Potongan Kode Utama (Service AI)

Kode utama yang merakit *prompt* dan memanggil layanan AI berada pada file `server/services/foodVerification.js`.

```javascript
// server/services/foodVerification.js
const { callGeminiWithRotation } = require("./aiUtils");

async function verifyFood(data, userId) {
    const prompt = `
        Anda adalah Senior Food Safety Auditor & Environmental Analyst.
        DATA INPUT:
        - Nama Makanan: ${data.foodName}
        - Bahan: ${data.ingredients}
        - Waktu Masak: ${data.madeTime}
        - Waktu Mulai Distribusi: ${data.distributionStart}
        - Berat Total: ${data.weightGram} gram
        
        KRITERIA AUDIT KETAT (GOLDEN RULES):
        1. VALIDASI DATA: Jika nama makanan atau bahan terlihat seperti data acak/ngawur (misal: "asdf", "abcd", "tes"), WAJIB berikan 'isSafe: false' dan 'qualityPercentage: 0'.
        2. ATURAN 4 JAM (TIME-GAP): Makanan matang hanya aman di suhu ruang maksimal 4 jam. 
           - Jika (Waktu Distribusi - Waktu Masak) > 4 jam: Berikan peringatan keras dan kurangi skor drastis.
           - Jika (Waktu Distribusi - Waktu Masak) > 8 jam: WAJIB berikan 'isSafe: false' dan 'qualityPercentage < 20'.
        3. VISUAL CONSISTENCY: Nama makanan dan bahan harus sinkron dengan data visual (identifikasi bahan dari deskripsi).
        4. ALERGEN: Deteksi semua potensi alergen (Telur, Susu, Seafood, Kacang, Gandum, Kedelai).
        
        TUGAS 1: Klasifikasikan bahan ke kategori LCA (Daging Merah, Unggas & Telur, Ikan & Seafood, Karbohidrat, Sayur & Buah, Lainnya).
        TUGAS 2: Audit Keamanan (Microbiology Risk) berdasarkan selisih waktu.
        TUGAS 3: Hitung skor Halal berdasarkan bahan yang disebutkan.

        OUTPUT JSON:
        {
          "isSafe": boolean,
          "isHalal": boolean,
          "halalScore": integer (0-100),
          "reasoning": string,
          "hygieneScore": integer (0-100),
          "qualityPercentage": integer (0-100),
          "detectedAllergens": [string],
          "shelfLifePrediction": string,
          "storageTips": [string],
          "detectedItems": [ { "name": "Bahan", "category": "Kategori" } ]
        }
    `;

    // Memanggil API Gemini dengan opsi return berupa JSON dan menyertakan data gambar (Vision)
    return await callGeminiWithRotation(userId, prompt, { isJson: true, image: data.image });
}
```

## 2. Alur Kerja Verifikasi

1. **Pengiriman Data dari Frontend:** Pengguna mengunggah gambar makanan beserta rincian nama makanan, bahan dasar, serta waktu dimasak. Data tersebut dikirim via *endpoint* sentral `POST /api` dengan aksi `VERIFY_FOOD`.
2. **Pemrosesan di Backend (`server/index.js`):** Route akan menerima permintaan dan meneruskannya ke fungsi `verifyFood(data.payload, data.actorId)`.
3. **Penyusunan Prompt (`foodVerification.js`):** Fungsi akan merakit teks instruksi (arsitektur prompt) yang dengan tegas meminta AI untuk berperan sebagai *Food Safety Auditor*. AI diberikan **Golden Rules**, contohnya *Aturan 4 Jam* (makanan tidak aman jika terpapar suhu ruang > 4-8 jam) dan pencegahan *spam* (data acak).
4. **Panggilan ke Google Gemini (`aiUtils.js`):** Fungsi `callGeminiWithRotation` akan melakukan eksekusi panggilan ke Google Gemini API secara aman. Parameter `options.image` diparsing menjadi format *base64* dan diumpankan sebagai tipe `image/jpeg` ke dalam atribut `inlineData` bersama dengan instruksi teks (*multimodal content*).
5. **Logika Penentuan Kelayakan:**
    - Penentuan makanan layak atau tidak diserahkan pada kemampuan penalaran (LLM reasoning) dari model Gemini berdasarkan *Golden Rules* yang dipasang di prompt.
    - Output diatur agar dikembalikan murni sebagai JSON murni (`responseMimeType: "application/json"`).
    - Status utama yang dikembalikan adalah atribut boolean `"isSafe"`.
    - Jika `"isSafe"` bernilai `false` (misal karena kadaluarsa / data *dummy*), aplikasi akan menggunakan atribut `"reasoning"` untuk memberikan edukasi/peringatan ke pengguna.
6. **Eksekusi Rotasi dan Pengembalian Hasil:** Jika kuota API habis, sistem (`aiUtils.js`) otomatis mencoba API Key selanjutnya (*rotation logic*). JSON hasil verifikasi kemudian diteruskan ke antarmuka aplikasi.
