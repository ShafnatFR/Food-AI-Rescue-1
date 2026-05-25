const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runMigration() {
    try {
        console.log('[MIGRATION] Starting database migration...');
        
        // Initialize pool first
        await db.initPool();
        
        // Read migration file
        const migrationPath = path.join(__dirname, 'migrations', '001_add_email_verification.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                console.log('[MIGRATION] Executing:', statement.substring(0, 80) + '...');
                await db.query(statement);
            }
        }
        
        console.log('[MIGRATION] ✓ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('[MIGRATION ERROR]', error);
        process.exit(1);
    }
}

runMigration();
