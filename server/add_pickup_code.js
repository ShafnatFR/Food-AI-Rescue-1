const db = require('./db');

async function migrate() {
    await db.initPool();
    console.log("Checking DB schema...");
    try {
        const [columns] = await db.query(`SHOW COLUMNS FROM claims LIKE 'pickup_code'`);
        if (columns.length === 0) {
            console.log("Adding pickup_code column to claims table...");
            await db.query(`ALTER TABLE claims ADD COLUMN pickup_code VARCHAR(255) NULL`);
            console.log("Migration successful.");
        } else {
            console.log("pickup_code column already exists.");
        }
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

migrate().finally(() => process.exit(0));
