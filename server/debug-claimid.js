const mysql = require('mysql2/promise');

async function test() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'foodairescue'
    });

    // Simulate what the backend does when it receives claimId from the frontend
    // The claim with pickup_code = 'PICKUP-9822' is ID 6
    // But what does the frontend send as order.id?

    console.log('=== Testing claimId validation ===');
    
    // The query finds the claim by pickup_code
    const [rows] = await db.query('SELECT * FROM claims WHERE pickup_code = ?', ['PICKUP-9822']);
    if (rows.length > 0) {
        const claim = rows[0];
        console.log('Found claim by pickup_code:');
        console.log('  DB id:', claim.id, typeof claim.id);
        console.log('  status:', claim.status);
        console.log('  delivery_method:', claim.delivery_method);
        
        // Test claimId comparison - what if frontend sends the numeric DB id?
        const claimIdFromFrontend = 6; // DB id
        console.log('\nTest: String(rows[0].id) !== String(claimId)');
        console.log('  String(rows[0].id):', String(claim.id));
        console.log('  String(claimIdFromFrontend):', String(claimIdFromFrontend));
        console.log('  Match:', String(claim.id) === String(claimIdFromFrontend));
        
        // Test with "CLM-" prefix that frontend generates
        const claimIdCLM = 'CLM-1234567890';
        console.log('\nTest with CLM prefix:');
        console.log('  String(rows[0].id):', String(claim.id));
        console.log('  String(claimIdCLM):', String(claimIdCLM));
        console.log('  Match:', String(claim.id) === String(claimIdCLM));
        
        // Status check
        console.log('\nStatus check for pickup:');
        console.log('  status:', claim.status);
        console.log('  Would block (IN_PROGRESS || COMPLETED):', claim.status === 'IN_PROGRESS' || claim.status === 'COMPLETED');
    }
    
    db.end();
}

test().catch(console.error);
