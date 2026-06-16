const mysql = require('mysql2/promise');

async function verifyOrderQR(data) {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'foodairescue'
    });

    const { uniqueCode, scannedByProviderName } = data;

    // Check unique_code first (Receiver handover)
    let query = 'SELECT * FROM claims WHERE unique_code = ?';
    let [rows] = await db.query(query, [uniqueCode]);
    let isPickup = false;

    console.log("after first query, rows.length:", rows.length);

    // If not found in unique_code, check pickup_code (Volunteer pickup)
    if (rows.length === 0) {
        query = 'SELECT * FROM claims WHERE pickup_code = ?';
        [rows] = await db.query(query, [uniqueCode]);
        console.log("after second query, rows.length:", rows.length);
        if (rows.length > 0) {
            isPickup = true;
        }
    }

    if (rows.length === 0) {
        db.end();
        throw new Error('Kode tidak valid');
    }

    db.end();
    return "SUCCESS!";
}

verifyOrderQR({ uniqueCode: 'PICKUP-9800' }).then(console.log).catch(console.error);
