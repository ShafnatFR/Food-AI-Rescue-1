const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
const PHOTO_PROFIL_DIR = path.join(ASSETS_DIR, 'fotoProfil');

// Ensure directories exist
if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR);
}
if (!fs.existsSync(PHOTO_PROFIL_DIR)) {
    fs.mkdirSync(PHOTO_PROFIL_DIR);
}

const sharp = require('sharp');

/**
 * Save Base64 image to local storage with auto-compression
 * @param {string} base64Data 
 * @param {string} filename 
 * @param {string} targetFolder - Optional subfolder name
 */
async function uploadToFileSystem(base64Data, filename, targetFolder = 'fotoProfil') {
    try {
        const uploadDir = path.join(ASSETS_DIR, targetFolder);
        
        // Ensure the target subfolder exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const base64Content = base64Data.split(',')[1] || base64Data;
        const buffer = Buffer.from(base64Content, 'base64');
        const filePath = path.join(uploadDir, filename);
        
        // Sharp processing: Resize to max 1200x1200px and compress to JPEG (quality 80)
        // This ensures file size is significantly reduced while maintaining quality
        await sharp(buffer)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(filePath);

        // Check file size and compress further if > 2MB (rare for 1200px jpeg @ 80%)
        let stats = fs.statSync(filePath);
        if (stats.size > 2 * 1024 * 1024) {
            console.log(`[FILE] File still > 2MB (${(stats.size / 1024 / 1024).toFixed(2)}MB). Compressing further...`);
            const tempPath = filePath + '.tmp';
            await sharp(filePath)
                .jpeg({ quality: 60 })
                .toFile(tempPath);
            fs.renameSync(tempPath, filePath);
        }

        // Return the relative URL path
        return `/assets/${targetFolder}/${filename}`;
    } catch (error) {
        console.error('File Upload & Compression Error:', error);
        throw error;
    }
}

/**
 * Delete a file by its URL
 */
async function deleteFile(fileUrl) {
    if (!fileUrl) return;
    
    // Extract the relative path. e.g. from "http://localhost:5000/assets/fotoProfil/xyz.jpg" to "/assets/fotoProfil/xyz.jpg"
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
            console.log(`[FILE] Deleted old asset: ${filePath}`);
        }
    } catch (error) {
        console.error(`[FILE] Failed to delete old asset: ${fileUrl}`, error);
    }
}

module.exports = { uploadToFileSystem, deleteFile };
