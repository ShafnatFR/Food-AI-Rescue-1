const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// --- HELPER: Action Router ---
// Mirrored from GAS doPost structure to make it easy to refactor frontend db.ts
app.post('/api', async (req, res) => {
    const { action, data } = req.body;
    console.log(`[ACTION] ${action}`);

    try {
        let result;
        switch (action) {
            case 'REGISTER_USER': result = await registerUser(data); break;
            case 'LOGIN_USER': result = await loginUser(data); break;
            case 'GET_USERS': result = await getAllData('users'); break;
            case 'UPSERT_USER': result = await upsertUser(data); break;
            
            case 'GET_ADDRESSES': result = await getAddresses(data.userId); break;
            case 'ADD_ADDRESS': result = await addAddress(data); break;
            case 'UPDATE_ADDRESS': result = await updateAddress(data); break;
            case 'DELETE_ADDRESS': result = await deleteData('addresses', data.id); break;

            case 'GET_INVENTORY': result = await getInventory(data.providerId); break;
            case 'ADD_FOOD_ITEM': result = await addFoodItem(data); break;
            case 'UPDATE_FOOD_STOCK': result = await updateFoodStock(data.id, data.newQuantity); break;
            case 'UPDATE_FOOD_ITEM': result = await updateFoodItem(data); break;
            case 'DELETE_FOOD_ITEM': result = await deleteData('inventory', data.id); break;

            case 'GET_CLAIMS': result = await getClaims(data.providerId, data.receiverId); break;
            case 'PROCESS_CLAIM': result = await processClaim(data); break;
            case 'UPDATE_CLAIM_STATUS': result = await updateClaimStatus(data.id || data.claimId, data.status, data.additionalData); break;
            case 'VERIFY_ORDER_QR': result = await verifyOrderQR(data); break;
            case 'SUBMIT_REVIEW': result = await submitReview(data); break;
            case 'SUBMIT_REPORT': result = await submitReport(data); break;

            case 'GET_FAQS': result = await getAllData('faqs'); break;
            case 'GET_NOTIFICATIONS': result = await getAllData('notifications'); break;
            case 'SEND_BROADCAST': result = await sendBroadcast(data); break;
            
            case 'UPLOAD_IMAGE': 
                const { uploadToFileSystem } = require('./fileService');
                const targetFolder = data.folderType || 'fotoProfil'; 
                const filePath = await uploadToFileSystem(data.base64, data.filename, targetFolder); 
                // Return full URL (assuming backend is on same host)
                result = `http://localhost:${port}${filePath}`;
                break;

            default:
                return res.status(400).json({ status: 'error', message: `Action '${action}' not found` });
        }

        res.json({ status: 'success', data: result });
    } catch (error) {
        console.error(`[ERROR] ${action}:`, error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- HELPERS ---
const ROLE_MAP = {
    'provider': 'DONATUR',
    'receiver': 'PENERIMA',
    'volunteer': 'RELAWAN',
    'admin_manager': 'ADMIN',
    'super_admin': 'SUPER_ADMIN'
};

const mapRole = (role) => ROLE_MAP[role] || role;

// --- IMPLEMENTATIONS ---

async function registerUser(data) {
    const { name, email, password, role, phone, avatar } = data;
    // Check if email exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) throw new Error('Email ini sudah terdaftar.');

    const [result] = await db.query(
        'INSERT INTO users (name, email, password, role, phone, avatar, points, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, password, mapRole(role), phone, avatar, 0, 'ACTIVE']
    );
    return { id: result.insertId, ...data, isNewUser: true, status: 'ACTIVE', points: 0 };
}

async function loginUser(data) {
    const { email, password } = data;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length === 0) throw new Error('Email atau Password salah.');
    const user = rows[0];
    delete user.password;
    // Reverse map role if needed for frontend
    const reverseRole = Object.keys(ROLE_MAP).find(key => ROLE_MAP[key] === user.role);
    if (reverseRole) user.role = reverseRole;
    user.isNewUser = true; 
    return user;
}

async function getAllData(table) {
    const [rows] = await db.query(`SELECT * FROM ${table}`);
    return rows;
}

async function upsertUser(data) {
    const { id, syncAddressIds, ...fields } = data;
    if (id) {
        // 1. Fetch current data for comparison
        const [oldUsers] = await db.query('SELECT name, phone, avatar FROM users WHERE id = ?', [id]);
        const oldUser = oldUsers[0];

        const updates = [];
        const values = [];
        const validColumns = ['name', 'email', 'role', 'phone', 'avatar', 'points', 'status', 'password', 'selected_badge_id'];

        let newName = oldUser?.name;
        let newPhone = oldUser?.phone;

        for (const [key, value] of Object.entries(fields)) {
            if (validColumns.includes(key) && value !== undefined) {
                let finalValue = value;
                if (key === 'role') finalValue = mapRole(value);
                if (key === 'status') finalValue = String(value).toUpperCase();

                if (key === 'name') newName = value;
                if (key === 'phone') {
                    finalValue = String(value).replace(/\D/g, '');
                    newPhone = finalValue;
                }

                updates.push(`${key} = ?`);
                values.push(finalValue);
            }
        }

        if (updates.length > 0) {
            values.push(id);
            await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

            if (fields.avatar && oldUser.avatar && fields.avatar !== oldUser.avatar) {
                const { deleteFile } = require('./fileService');
                await deleteFile(oldUser.avatar);
            }

            // 2. GRANULAR Synchronize Addresses if syncConfigs provided
            // syncConfigs: { [addressId]: { name: boolean, phone: boolean } }
            if (data.syncConfigs && typeof data.syncConfigs === 'object') {
                for (const [addrId, config] of Object.entries(data.syncConfigs)) {
                    const addrUpdates = [];
                    const addrValues = [];
                    if (config.name) {
                        addrUpdates.push('contact_name = ?');
                        addrValues.push(newName);
                    }
                    if (config.phone) {
                        addrUpdates.push('contact_phone = ?');
                        addrValues.push(newPhone);
                    }

                    if (addrUpdates.length > 0) {
                        console.log(`[SYNC] Updating address ${addrId} with fields:`, config);
                        addrValues.push(id, addrId);
                        await db.query(
                            `UPDATE addresses SET ${addrUpdates.join(', ')} WHERE user_id = ? AND id = ?`,
                            addrValues
                        );
                    }
                }
            }
        }
        return data;
    } else {
        return registerUser(data);
    }
}

async function getAddresses(userId) {
    const query = userId ? 'SELECT id, user_id as userId, label, full_address as fullAddress, contact_name as contactName, contact_phone as contactPhone, is_primary as isPrimary, latitude as lat, longitude as lng FROM addresses WHERE user_id = ?' : 'SELECT * FROM addresses';
    const [rows] = await db.query(query, [userId]);
    return rows.map(r => ({ ...r, isPrimary: !!r.isPrimary }));
}

async function addAddress(data) {
    const { userId, label, fullAddress, contactName, contactPhone, isPrimary, lat, lng } = data;
    if (isPrimary) {
        await db.query('UPDATE addresses SET is_primary = FALSE WHERE user_id = ?', [userId]);
    }
    const [result] = await db.query(
        'INSERT INTO addresses (user_id, label, full_address, contact_name, contact_phone, is_primary, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, label, fullAddress, contactName, contactPhone, isPrimary ? 1 : 0, lat, lng]
    );
    return { id: result.insertId, ...data };
}

async function updateAddress(data) {
    console.log(`[DB] Updating address ID: ${data.id}`);
    const { id, userId, label, fullAddress, contactName, contactPhone, isPrimary, lat, lng } = data;
    if (isPrimary) {
        await db.query('UPDATE addresses SET is_primary = FALSE WHERE user_id = ?', [userId]);
    }
    await db.query(
        'UPDATE addresses SET label=?, full_address=?, contact_name=?, contact_phone=?, is_primary=?, latitude=?, longitude=? WHERE id=?',
        [label, fullAddress, contactName, contactPhone, isPrimary ? 1 : 0, lat, lng, id]
    );
    return data;
}

async function getInventory(providerId) {
    // Join with addresses to mirror backend.gs 'getInventoryWithLocation'
    let query = `
        SELECT f.id, f.provider_id as providerId, f.name, f.description, 
               f.initial_quantity as initialQuantity, f.current_quantity as currentQuantity, 
               f.expiry_time as expiryTime, f.image_url as imageUrl, 
               f.delivery_method as deliveryMethod, f.status,
               a.latitude as lat, a.longitude as lng, a.full_address as address, a.id as addressId
        FROM food_items f
        LEFT JOIN addresses a ON f.provider_id = a.user_id AND a.is_primary = 1
    `;
    const params = [];
    if (providerId) {
        query += ' WHERE f.provider_id = ?';
        params.push(providerId);
    }
    const [rows] = await db.query(query, params);
    return rows.map(item => ({
        ...item,
        location: item.lat ? {
            lat: item.lat,
            lng: item.lng,
            address: item.address,
            addressId: item.addressId
        } : null
    }));
}

async function addFoodItem(data) {
    const { providerId, name, description, initialQuantity, currentQuantity, expiryTime, imageUrl, deliveryMethod } = data;
    const [result] = await db.query(
        'INSERT INTO food_items (provider_id, name, description, initial_quantity, current_quantity, max_quantity, expiry_time, distribution_start_time, distribution_end_time, delivery_method, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [providerId, name, description, initialQuantity, currentQuantity, initialQuantity, expiryTime, '08:00:00', '20:00:00', deliveryMethod.toUpperCase(), imageUrl]
    );
    return { id: result.insertId, ...data };
}

async function updateFoodStock(id, newQuantity) {
    await db.query('UPDATE food_items SET current_quantity = ? WHERE id = ?', [newQuantity, id]);
    return { id, newQuantity };
}

async function updateFoodItem(data) {
    const { id, name, description, currentQuantity, expiryTime, imageUrl, deliveryMethod, status } = data;
    await db.query(
        'UPDATE food_items SET name=?, description=?, current_quantity=?, expiry_time=?, image_url=?, delivery_method=?, status=? WHERE id=?',
        [name, description, currentQuantity, expiryTime, imageUrl, deliveryMethod.toUpperCase(), status.toUpperCase(), id]
    );
    return data;
}

async function deleteData(table, id) {
    const tableName = table === 'inventory' ? 'food_items' : table;
    await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    return { id, status: 'deleted' };
}

async function getClaims(providerId, receiverId) {
    let query = `
        SELECT c.*, f.name as foodName, u.name as providerName, 
               a_prov.latitude as prov_lat, a_prov.longitude as prov_lng, a_prov.full_address as prov_addr,
               a_prov.contact_name as prov_contact, a_prov.contact_phone as prov_phone,
               a_rec.latitude as rec_lat, a_rec.longitude as rec_lng, a_rec.full_address as rec_addr,
               a_rec.contact_name as rec_contact, a_rec.contact_phone as rec_phone
        FROM claims c 
        JOIN food_items f ON c.food_id = f.id 
        JOIN users u ON f.provider_id = u.id
        LEFT JOIN addresses a_prov ON f.provider_id = a_prov.user_id AND a_prov.is_primary = 1
        LEFT JOIN addresses a_rec ON c.receiver_id = a_rec.user_id AND a_rec.is_primary = 1
        WHERE 1=1
    `;
    const params = [];
    if (providerId) {
        query += ' AND f.provider_id = ?';
        params.push(providerId);
    }
    if (receiverId) {
        query += ' AND c.receiver_id = ?';
        params.push(receiverId);
    }
    const [rows] = await db.query(query, params);
    return rows.map(c => ({
        ...c,
        foodId: c.food_id,
        receiverId: c.receiver_id,
        volunteerId: c.volunteer_id,
        claimedQuantity: c.claimed_quantity,
        deliveryMethod: c.delivery_method,
        uniqueCode: c.unique_code,
        isScanned: !!c.is_scanned,
        receiverName: c.rec_contact || c.receiverName, // Use contact name from address if available
        receiverPhone: c.rec_phone,
        donorPhone: c.prov_phone,
        providerLocation: { lat: c.prov_lat, lng: c.prov_lng, address: c.prov_addr },
        receiverLocation: { lat: c.rec_lat, lng: c.rec_lng, address: c.rec_addr },
        location: { lat: c.prov_lat, lng: c.prov_lng, address: c.prov_addr } // Consistent with original backend.gs
    }));
}

async function processClaim(payload) {
    const { foodId, quantityToReduce, claimData } = payload;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [inv] = await connection.query('SELECT current_quantity FROM food_items WHERE id = ? FOR UPDATE', [foodId]);
        if (inv.length === 0) throw new Error('Item not found');
        if (inv[0].current_quantity < quantityToReduce) throw new Error('Stock not enough');

        const newStock = inv[0].current_quantity - quantityToReduce;
        await connection.query('UPDATE food_items SET current_quantity = ? WHERE id = ?', [newStock, foodId]);

        const [addr] = await connection.query('SELECT id FROM addresses WHERE user_id = ? AND is_primary = 1 LIMIT 1', [claimData.receiverId]);
        const addressId = addr.length > 0 ? addr[0].id : null;
        if (!addressId) throw new Error('Receiver must have a primary address to claim');

        const [claimResult] = await connection.query(
            'INSERT INTO claims (food_id, receiver_id, address_id, claimed_quantity, delivery_method, status, unique_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [foodId, claimData.receiverId, addressId, quantityToReduce, claimData.deliveryMethod.toUpperCase(), 'PENDING', claimData.uniqueCode]
        );

        await connection.commit();
        return { success: true, newStock, claimId: claimResult.insertId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function updateClaimStatus(id, status, additionalData) {
    await db.query('UPDATE claims SET status = ? WHERE id = ?', [status.toUpperCase(), id]);
    return { id, status: status.toUpperCase() };
}

async function verifyOrderQR(data) {
    const { uniqueCode } = data;
    const [rows] = await db.query('SELECT * FROM claims WHERE unique_code = ?', [uniqueCode]);
    if (rows.length === 0) throw new Error('Kode tidak valid');
    if (rows[0].is_scanned) return { success: false, message: 'ALREADY_SCANNED' };

    await db.query('UPDATE claims SET is_scanned = 1, status = "COMPLETED" WHERE id = ?', [rows[0].id]);
    return { success: true, message: 'VERIFIED', claimId: rows[0].id };
}

async function submitReview(data) {
    const { claimId, rating, review, reviewMedia } = data;
    const [claim] = await db.query('SELECT * FROM claims WHERE id = ?', [claimId]);
    if (claim.length === 0) throw new Error('Claim not found');
    
    const [food] = await db.query('SELECT provider_id FROM food_items WHERE id = ?', [claim[0].food_id]);
    
    await db.query(
        'INSERT INTO reviews (claim_id, user_id, partner_id, food_id, rating, comment, review_media) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [claimId, claim[0].receiver_id, food[0].provider_id, claim[0].food_id, rating, review, JSON.stringify(reviewMedia)]
    );
    return { status: 'success' };
}

async function submitReport(data) {
    const { claimId, reason, description, evidence } = data;
    const [claim] = await db.query('SELECT receiver_id FROM claims WHERE id = ?', [claimId]);
    await db.query(
        'INSERT INTO reports (reporter_id, claim_id, category, description, evidence_photo, status) VALUES (?, ?, ?, ?, ?, ?)',
        [claim[0].receiver_id, claimId, reason, description, evidence, 'NEW']
    );
    return { status: 'success', claimId };
}

async function sendBroadcast(data) {
    const { title, content, target } = data;
    try {
        const [result] = await db.query('INSERT INTO notifications (title, content, target) VALUES (?, ?, ?)', [title, content, target.toUpperCase()]);
        return { id: result.insertId, ...data, sentAt: new Date() };
    } catch (e) {
        console.warn('Notifications table not found');
        return data;
    }
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
