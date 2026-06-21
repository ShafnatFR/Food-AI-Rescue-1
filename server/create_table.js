const db = require('./db');

async function run() {
    await db.initPool();
    await db.query(`
        CREATE TABLE IF NOT EXISTS user_badges (
            user_id INT NOT NULL,
            badge_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, badge_id)
        )
    `);
    console.log('Table user_badges created!');
    process.exit(0);
}
run().catch(console.error);
