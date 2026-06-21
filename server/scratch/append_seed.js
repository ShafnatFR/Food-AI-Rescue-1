const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');

async function appendSeedToSchema() {
    const defaultHash = await bcrypt.hash('123456', 10);
    const superHash = await bcrypt.hash('123456', 10);

    const sql = `
-- ------------------------------------------------------------
-- Data default: Akun Dummy untuk Pengujian
-- Password untuk semua akun adalah: 123456
-- ------------------------------------------------------------
INSERT INTO users (name, email, password, role, status, points) VALUES
('Superadmin', 'superadmin@demo.com', '${superHash}', 'SUPER_ADMIN', 'ACTIVE', 0),
('penerima1', 'penerima1@demo.com', '${defaultHash}', 'RECIPIENT', 'ACTIVE', 0),
('donaturKorporat', 'donaturkorporat@demo.com', '${defaultHash}', 'CORPORATE_DONOR', 'ACTIVE', 0),
('donaturIndividu1', 'donaturindividu@demo.com', '${defaultHash}', 'INDIVIDUAL_DONOR', 'ACTIVE', 0),
('relawan1', 'relawan1@demo.com', '${defaultHash}', 'VOLUNTEER', 'ACTIVE', 0)
ON CONFLICT (email) DO NOTHING;
`;

    const schemaPath = path.join(__dirname, '../schema-pg.sql');
    fs.appendFileSync(schemaPath, sql);
    console.log("Appended dummy users to schema-pg.sql");
}

appendSeedToSchema();
