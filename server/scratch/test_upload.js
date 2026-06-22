const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { uploadToFileSystem } = require('../fileService');
const fs = require('fs');

async function testUpload() {
    console.log("=== Testing Supabase Upload ===");
    console.log("Using URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Has Service Key:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    try {
        // Create a tiny 1x1 pixel transparent PNG in base64
        const tinyPngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
        
        console.log("Uploading dummy image...");
        const resultUrl = await uploadToFileSystem(tinyPngBase64, `test_image_${Date.now()}.png`, 'inventory');
        
        console.log("✅ Upload Success!");
        console.log("🔗 File URL:", resultUrl);
        
        // Coba insert URL ini ke database untuk testing
        const db = require('../db');
        await db.initPool();
        console.log("DB Pool Initialized. Inserting dummy record...");
        
        // Cari dummy user (provider)
        const [users] = await db.query('SELECT id FROM users WHERE role = ? LIMIT 1', ['PROVIDER']);
        const providerId = users.length > 0 ? users[0].id : 1;

        const [res] = await db.query(`
            INSERT INTO food_items 
            (provider_id, name, description, initial_quantity, current_quantity, min_quantity, max_quantity, image_url, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            providerId, 
            'Tes Supabase Image', 
            'Ini adalah data testing untuk memastikan gambar muncul dengan benar.', 
            10, 10, 1, 5, 
            resultUrl, 
            'AVAILABLE'
        ]);

        console.log("✅ Database Insert Success! ID:", res.insertId);
        process.exit(0);
    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
}

testUpload();
