const mysql = require('mysql2/promise');

async function test() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'foodairescue'
    });

    console.log('=== Before reset ===');
    const [before] = await db.query('SELECT id, status, pickup_code, is_scanned FROM claims WHERE id IN (5, 6)');
    console.table(before);

    // Reset status claim 5 & 6 ke PENDING agar bisa di-scan kembali (pickup_code belum pernah di-scan)
    // Ini karena status IN_PROGRESS terjadi akibat bug sebelumnya (relawan langsung set IN_PROGRESS)
    await db.query(
        "UPDATE claims SET status = 'PENDING', courier_status = 'picking_up' WHERE id IN (5, 6) AND is_scanned = 0"
    );

    console.log('\n=== After reset ===');
    const [after] = await db.query('SELECT id, status, pickup_code, is_scanned FROM claims WHERE id IN (5, 6)');
    console.table(after);

    console.log('\nDone! Claims 5 & 6 have been reset to PENDING so pickup codes can be scanned again.');
    
    db.end();
}

test().catch(console.error);
