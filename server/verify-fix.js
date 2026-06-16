const mysql = require('mysql2/promise');

async function test() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'foodairescue'
    });

    console.log('=== Simulating verifyOrderQR with pickup_code ===');

    // Simulate: expectedType = 'pickup_code', uniqueCode = 'PICKUP-9822', claimId = 6
    const uniqueCode = 'PICKUP-9822';
    const claimId = 6;

    const query = 'SELECT c.*, fi.name AS food_name FROM claims c LEFT JOIN food_items fi ON c.food_id = fi.id WHERE c.pickup_code = ?';
    const [rows] = await db.query(query, [uniqueCode]);
    
    console.log('Query result:', rows.length, 'rows found');
    if (rows.length > 0) {
        const claim = rows[0];
        console.log('  id:', claim.id, '| food_name:', claim.food_name, '| status:', claim.status);
        
        // claimId check
        const claimIdMatch = String(claim.id) === String(claimId);
        console.log('  claimId match (6 vs', claim.id, '):', claimIdMatch);
        
        // Status check (new logic: only block if COMPLETED)
        const wouldBlock = claim.status === 'COMPLETED';
        console.log('  Would block pickup scan (only COMPLETED):', wouldBlock);
        
        if (!wouldBlock && claimIdMatch) {
            console.log('\n✅ SUCCESS: Pickup code would be VERIFIED!');
            console.log('   Status would change to: IN_PROGRESS');
        } else {
            console.log('\n❌ BLOCKED:', wouldBlock ? 'already COMPLETED' : 'claimId mismatch');
        }
    }
    
    db.end();
}

test().catch(console.error);
