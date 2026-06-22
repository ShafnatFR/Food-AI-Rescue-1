const db = require('./server/db');

async function checkData() {
    try {
        await db.initPool();
        const connection = await db.getConnection();
        const [items] = await connection.query(`
        SELECT f.id, f.provider_id as providerId, f.name, f.description, 
               f.initial_quantity as initialQuantity, f.current_quantity as currentQuantity, 
               f.created_at as createdAt
        FROM food_items f
        WHERE f.provider_id = 7
        `);
        console.log("MAPPED ITEMS:", items);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkData();
