const db = require('./db');
async function run() {
    await db.initPool();
    const [rows] = await db.query(`SELECT c.id, c.status, f.name, u_prov.name as providerName FROM claims c JOIN food_items f ON c.food_id = f.id JOIN users u_prov ON f.provider_id = u_prov.id`);
    console.log("CLAIMS:", rows);
}
run().catch(console.error).finally(()=>process.exit(0));
