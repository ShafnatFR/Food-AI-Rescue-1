const { Pool } = require('pg');

// URL Encode password in case of special characters
const password = encodeURIComponent('bw!wm*jL,8-r7ht');
const connectionString = `postgresql://postgres.ttpwubrflbfymefixuav:${password}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;

const pool = new Pool({
  connectionString,
});

async function testConnection() {
  console.log("Mencoba koneksi ke Supabase PostgreSQL Pooler...");
  try {
    const client = await pool.connect();
    console.log("✅ BERHASIL: Koneksi ke Supabase berhasil!");
    
    // Coba jalankan query sederhana
    const res = await client.query('SELECT NOW()');
    console.log("Waktu dari server database:", res.rows[0].now);
    
    client.release();
  } catch (err) {
    console.error("❌ GAGAL: Tidak dapat terhubung ke Supabase.");
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
