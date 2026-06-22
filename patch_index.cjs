const fs = require('fs');

let content = fs.readFileSync('server/index.js', 'utf8');

// 1. getInventory
content = content.replace(
    'LEFT JOIN addresses a ON f.provider_id = a.user_id AND a.is_primary = 1',
    'LEFT JOIN addresses a ON f.address_id = a.id'
);

// 2. addFoodItem signature
content = content.replace(
    'const { providerId, name, description, initialQuantity, currentQuantity, expiryTime, imageUrl, deliveryMethod, aiVerification, socialImpact } = data;',
    'const { providerId, addressId, name, description, initialQuantity, currentQuantity, expiryTime, imageUrl, deliveryMethod, aiVerification, socialImpact } = data;'
);

// 3. addFoodItem insert query
content = content.replace(
    "'INSERT INTO food_items (provider_id, name, description, initial_quantity, current_quantity, min_quantity, max_quantity, expiry_time, distribution_start_time, distribution_end_time, delivery_method, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',",
    "'INSERT INTO food_items (provider_id, address_id, name, description, initial_quantity, current_quantity, min_quantity, max_quantity, expiry_time, distribution_start_time, distribution_end_time, delivery_method, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',"
);

// 4. addFoodItem insert values
content = content.replace(
    "[providerId, name, description, initialQuantity, currentQuantity, data.minQuantity || 1, data.maxQuantity || initialQuantity, expiryDateTime, distStart, distEnd, deliveryMethod.toUpperCase(), (data.category || 'OTHER').toUpperCase(), imageUrl]",
    "[providerId, addressId || null, name, description, initialQuantity, currentQuantity, data.minQuantity || 1, data.maxQuantity || initialQuantity, expiryDateTime, distStart, distEnd, deliveryMethod.toUpperCase(), (data.category || 'OTHER').toUpperCase(), imageUrl]"
);

// 5. initializeApp concurrency fix
const initOld = `let initialized = false;
async function initializeApp() {
    if (initialized) return;
    const checkAndReset = require('./resetHandler');
    await checkAndReset();
    await db.initPool();       // cek koneksi + buat DB/tabel jika belum ada
    await loadAppSettings();   // load settings dari DB ke memori
    initialized = true;
}`;

const initNew = `let initialized = false;
let initializingPromise = null;

async function initializeApp() {
    if (initialized) return;
    if (initializingPromise) return initializingPromise;
    
    initializingPromise = (async () => {
        try {
            const checkAndReset = require('./resetHandler');
            await checkAndReset();
            await db.initPool();       // cek koneksi + buat DB/tabel jika belum ada
            await loadAppSettings();   // load settings dari DB ke memori
            initialized = true;
        } finally {
            initializingPromise = null;
        }
    })();
    return initializingPromise;
}`;

content = content.replace(initOld, initNew);

fs.writeFileSync('server/index.js', content, 'utf8');
console.log('Patched server/index.js');
