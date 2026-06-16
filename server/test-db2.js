const mysql = require('mysql2/promise');

async function test() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'foodairescue'
    });

    const [rows] = await db.query('SELECT id, status, unique_code, pickup_code FROM claims WHERE id = 4');
    console.log(rows[0]);
    console.log("pickup_code length:", rows[0].pickup_code.length);
    console.log("pickup_code characters:", rows[0].pickup_code.split('').map(c => c.charCodeAt(0)));
    
    db.end();
}

test();
