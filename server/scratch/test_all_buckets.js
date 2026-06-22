const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { uploadToFileSystem } = require('../fileService');

async function testAllBuckets() {
    console.log("=== Menguji Semua Supabase Buckets ===");
    
    const bucketsToTest = ['inventory', 'profiles', 'fotoProfil', 'reviews', 'reports'];
    // Gambar 1x1 transparan
    const tinyPngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
    
    let successCount = 0;

    for (const folder of bucketsToTest) {
        console.log(`\n▶ Menguji unggah ke: ${folder}`);
        try {
            const resultUrl = await uploadToFileSystem(tinyPngBase64, `test_${folder}_${Date.now()}.png`, folder);
            console.log(`✅ BERHASIL! URL: ${resultUrl}`);
            successCount++;
        } catch (error) {
            console.error(`❌ GAGAL! Error: ${error.message}`);
        }
    }

    console.log(`\n=== Hasil Akhir: ${successCount} dari ${bucketsToTest.length} Berhasil ===`);
    process.exit(successCount === bucketsToTest.length ? 0 : 1);
}

testAllBuckets();
