const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const passwordStr = encodeURIComponent('bw!wm*jL,8-r7ht');
const connectionString = `postgresql://postgres.ttpwubrflbfymefixuav:${passwordStr}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;

const pool = new Pool({
  connectionString,
});

async function seedDatabase() {
  console.log("Mencoba koneksi untuk seed data dummy...");
  try {
    const client = await pool.connect();
    console.log("✅ Terhubung ke Supabase PostgreSQL!");

    // Cek apakah tabel users sudah ada
    const res = await client.query("SELECT count(*) FROM users");
    if (parseInt(res.rows[0].count) > 0) {
        console.log("⚠️ Tabel 'users' sudah berisi data. Melewati proses seeding agar data tidak ganda.");
        client.release();
        return;
    }

    console.log("Membuat hash password...");
    const defaultHash = await bcrypt.hash('123456', 10);
    const superHash = await bcrypt.hash('123456', 10); // Superadmin juga 123456 untuk testing

    const users = [
        { name: 'Superadmin', email: 'superadmin@demo.com', password: superHash, role: 'SUPER_ADMIN' },
        { name: 'penerima1', email: 'penerima1@demo.com', password: defaultHash, role: 'RECIPIENT' },
        { name: 'donaturKorporat', email: 'donaturkorporat@demo.com', password: defaultHash, role: 'CORPORATE_DONOR' },
        { name: 'donaturIndividu1', email: 'donaturindividu@demo.com', password: defaultHash, role: 'INDIVIDUAL_DONOR' },
        { name: 'relawan1', email: 'relawan1@demo.com', password: defaultHash, role: 'VOLUNTEER' }
    ];

    console.log("Memasukkan data akun dummy...");
    for (const user of users) {
        await client.query(
            'INSERT INTO users (name, email, password, role, status, points) VALUES ($1, $2, $3, $4, $5, $6)',
            [user.name, user.email, user.password, user.role, 'ACTIVE', 0]
        );
    }
    console.log("✅ 5 Akun dummy berhasil dimasukkan!");

    client.release();
  } catch (err) {
    console.error("❌ GAGAL melakukan seeding:", err.message);
  } finally {
    await pool.end();
  }
}

seedDatabase();
