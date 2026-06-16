const mysql = require('mysql2/promise');

async function test() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'foodairescue'
    });

    console.log('=== Checking recent claims ===');
    const [claims] = await db.query(
        'SELECT id, food_id, status, delivery_method, unique_code, pickup_code, is_scanned FROM claims ORDER BY id DESC LIMIT 10'
    );
    console.table(claims);

    console.log('\n=== Searching for PICKUP codes ===');
    const [pickup] = await db.query("SELECT id, status, delivery_method, unique_code, pickup_code FROM claims WHERE pickup_code IS NOT NULL AND pickup_code != '' LIMIT 10");
    console.table(pickup);

    // Simulate what the query does
    const testCode = 'PICKUP-9822';
    console.log(`\n=== Testing lookup for code: ${testCode} ===`);
    const [rows1] = await db.query('SELECT * FROM claims WHERE pickup_code = ?', [testCode]);
    console.log('By pickup_code:', rows1.length, 'rows found');
    const [rows2] = await db.query('SELECT * FROM claims WHERE unique_code = ?', [testCode]);
    console.log('By unique_code:', rows2.length, 'rows found');
    
    db.end();
}

test().catch(console.error);
