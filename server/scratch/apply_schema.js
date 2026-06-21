const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const password = encodeURIComponent('bw!wm*jL,8-r7ht');
const connectionString = `postgresql://postgres.ttpwubrflbfymefixuav:${password}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;

const pool = new Pool({
  connectionString,
});

async function runSchema() {
  console.log("Mencoba koneksi & menjalankan skema database...");
  try {
    const client = await pool.connect();
    console.log("✅ Terhubung ke Supabase PostgreSQL!");
    
    const schemaPath = path.join(__dirname, '../schema-pg.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log("Menjalankan script pembuatan tabel...");
    await client.query(schemaSql);
    console.log("✅ Skema berhasil diaplikasikan ke database!");
    
    // Check if users table exists
    const res = await client.query("SELECT count(*) FROM users");
    console.log("✅ Tabel 'users' siap. Jumlah data:", res.rows[0].count);
    
    client.release();
  } catch (err) {
    console.error("❌ GAGAL menjalankan skema:", err.message);
  } finally {
    await pool.end();
  }
}

runSchema();
