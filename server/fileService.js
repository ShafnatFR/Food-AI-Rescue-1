const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
// Gunakan Service Role Key untuk bypass RLS saat mengunggah (karena server yang unggah)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Fallback folder lokal
const ASSETS_DIR = path.join(__dirname, 'assets');
if (!fs.existsSync(ASSETS_DIR)) {
    try { fs.mkdirSync(ASSETS_DIR); } catch (e) { }
}

/**
 * Save Base64 image to Supabase Storage or Local Storage
 */
async function uploadToFileSystem(base64Data, filename, targetFolder = 'inventory') {
    try {
        const base64Parts = base64Data.split(',');
        const mimeType = (base64Parts[0].match(/:(.*?);/)?.[1]) || 'image/jpeg';
        const base64Content = base64Parts[1] || base64Data;
        const buffer = Buffer.from(base64Content, 'base64');

        let finalBuffer = buffer;
        let finalMimeType = mimeType;

        if (mimeType.startsWith('image/')) {
            // Sharp processing: Resize to max 1200x1200px and compress to JPEG
            finalBuffer = await sharp(buffer)
                .resize(1200, 1200, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 })
                .toBuffer();
            
            finalMimeType = 'image/jpeg';

            if (finalBuffer.length > 2 * 1024 * 1024) {
                finalBuffer = await sharp(finalBuffer).jpeg({ quality: 60 }).toBuffer();
            }
        }

        // 1. SUPABASE UPLOAD (Utama untuk Vercel)
        if (supabase) {
            // Karena kita memakai 1 bucket 'Inventory' sesuai pesanan pengguna,
            // Jika targetFolder adalah fotoProfil, kita taruh di subfolder fotoProfil di dalam bucket Inventory
            const bucketName = 'Inventory';
            const filePath = targetFolder === 'inventory' ? filename : `${targetFolder}/${filename}`;

            console.log(`[FILE] Mengunggah ke Supabase Bucket: ${bucketName}, Path: ${filePath}`);

            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(filePath, finalBuffer, {
                    contentType: finalMimeType,
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error('[FILE] Supabase upload error details:', error);
                // Jika error karena RLS (Row Level Security), kita coba fallback ke lokal, tapi Vercel akan menolak
                throw new Error(`Supabase upload error: ${error.message}`);
            }

            // Dapatkan Public URL
            const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            console.log(`[FILE] Berhasil diunggah ke Supabase: ${urlData.publicUrl}`);
            return urlData.publicUrl; // Mengembalikan full URL https://
        }

        // 2. LOCAL FALLBACK (Hanya jalan di localhost/dev, gagal di Vercel)
        console.warn('[FILE] Peringatan: Kredensial Supabase tidak ditemukan. Menggunakan penyimpanan lokal (akan gagal di Vercel).');
        const uploadDir = path.join(ASSETS_DIR, targetFolder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const localFilePath = path.join(uploadDir, filename);

        if (mimeType.startsWith('image/')) {
             fs.writeFileSync(localFilePath, finalBuffer);
        } else {
             fs.writeFileSync(localFilePath, buffer);
        }

        return `/assets/${targetFolder}/${filename}`;
    } catch (error) {
        console.error('File Upload Error:', error);
        throw error;
    }
}

/**
 * Delete a file by its URL
 */
async function deleteFile(fileUrl) {
    if (!fileUrl) return;

    // Supabase Deletion
    if (fileUrl.includes('supabase.co/storage/v1/object/public/')) {
        try {
            if (!supabase) return;
            const urlParts = fileUrl.split('supabase.co/storage/v1/object/public/');
            const pathParts = urlParts[1].split('/');
            const bucketName = pathParts.shift(); // First part is bucket
            const filePath = pathParts.join('/'); // Rest is path

            console.log(`[FILE] Menghapus dari Supabase: Bucket=${bucketName}, Path=${filePath}`);
            await supabase.storage.from(bucketName).remove([filePath]);
        } catch (error) {
            console.error(`[FILE] Gagal menghapus dari Supabase: ${fileUrl}`, error);
        }
        return;
    }

    // Local deletion fallback
    let relativePath = fileUrl;
    try {
        if (fileUrl.startsWith('http')) {
            const urlObj = new URL(fileUrl);
            relativePath = urlObj.pathname;
        }
    } catch (e) {
        // Fallback if parsing fails
    }

    if (!relativePath.startsWith('/assets/')) return;

    try {
        const cleanPath = relativePath.replace('/assets/', '');
        const filePath = path.join(ASSETS_DIR, cleanPath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[FILE] Menghapus file lokal: ${filePath}`);
        }
    } catch (error) {
        console.error(`[FILE] Gagal menghapus file lokal: ${fileUrl}`, error);
    }
}

module.exports = { uploadToFileSystem, deleteFile };
