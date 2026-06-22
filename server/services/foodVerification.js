
const { callGeminiWithRotation } = require("./aiUtils");

/**
 * Service for Food Quality and Safety Verification
 */
async function verifyFood(data, userId) {
    const prompt = `
        Anda adalah Senior Food Safety Auditor & Environmental Analyst.
        DATA INPUT:
        - Nama Makanan: ${data.foodName}
        - Bahan: ${data.ingredients}
        - Waktu Masak: ${data.madeTime}
        - Waktu Mulai Distribusi: ${data.distributionStart}
        - Lokasi Penyimpanan: ${data.storageLocation || 'Suhu Ruangan'}
        - Berat Total: ${data.weightGram} gram
        
        KRITERIA AUDIT KETAT (GOLDEN RULES):
        1. VALIDASI DATA: Jika nama makanan atau bahan terlihat seperti data acak/ngawur (misal: "asdf", "abcd", "tes"), WAJIB berikan 'isSafe: false' dan 'qualityPercentage: 0'.
        2. ATURAN WAKTU & SUHU (DINAMIS):
           - Gunakan PENGETAHUAN ANDA untuk menentukan batas aman (expiry) berdasarkan JENIS BAHAN (misal: daging, ayam, sayur berkuah santan cepat basi, sedangkan roti/kue kering tahan lama) dan LOKASI PENYIMPANAN (suhu ruang, kulkas/chiller, freezer).
           - Hitung selisih Waktu Distribusi dan Waktu Masak. Lakukan evaluasi logis apakah makanan masih aman (isSafe) dan tentukan 'qualityPercentage' serta 'hygieneScore' sesuai tingkat risiko bahan tersebut pada lokasi penyimpanannya.
        3. VISUAL CONSISTENCY: Nama makanan dan bahan harus sinkron dengan data visual (identifikasi bahan dari deskripsi).
        4. ALERGEN: Deteksi semua potensi alergen (Telur, Susu, Seafood, Kacang, Gandum, Kedelai).
        
        TUGAS 1: Klasifikasikan bahan ke kategori LCA (Daging Merah, Unggas & Telur, Ikan & Seafood, Karbohidrat, Sayur & Buah, Lainnya).
        TUGAS 2: Audit Keamanan (Microbiology Risk) berdasarkan selisih waktu.
        TUGAS 3: Hitung skor Halal berdasarkan bahan yang disebutkan.
        TUGAS 4: Berikan panduan fisik (Sensory Check), pemanasan (Reheating), pengemasan (Packaging), ide daur ulang (Repurpose), dan peringatan kontaminasi (Cross-Contamination) sesuai dengan konteks makanan.

        PANDUAN PENULISAN:
        - WAJIB gunakan bahasa yang BERSAHABAT, SEDERHANA, dan MUDAH DIMENGERTI oleh ibu-ibu atau orang awam (hindari istilah teknis IT/Sains yang rumit).
        - Gunakan format MARKDOWN jika diperlukan.

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
          "physicalCheckTips": [string],
          "reheatingTips": [string],
          "packagingTips": [string],
          "repurposeIdeas": [string],
          "crossContaminationWarning": string,
          "detectedItems": [ { "name": "Bahan", "category": "Kategori" } ] // WAJIB MASUKKAN NAMA MAKANAN UTAMANYA DISINI, JANGAN HANYA ALERGEN!
        }
    `;

    return await callGeminiWithRotation(userId, prompt, { isJson: true, image: data.image });
}

module.exports = { verifyFood };
