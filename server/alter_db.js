const db = require('./db');
async function run() {
    await db.initPool();
    // First alter the claims table enum to allow PENDING_APPROVAL
    const q1 = "ALTER TABLE claims MODIFY COLUMN status ENUM('PENDING_APPROVAL', 'WAITING_PROVIDER', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING_APPROVAL';";
    await db.query(q1);
    console.log("Altered enum status.");
    
    // Now update any NULL statuses to PENDING_APPROVAL
    const q2 = "UPDATE claims SET status = 'PENDING_APPROVAL' WHERE status IS NULL OR status = '';";
    const res = await db.query(q2);
    console.log("Updated null statuses:", res[0]);
}
run().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
