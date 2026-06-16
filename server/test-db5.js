const mysql = require('mysql2/promise');

async function test() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'foodairescue'
    });

    const [rows] = await db.query('SELECT id, status, unique_code, pickup_code FROM claims');
    console.log(rows);
    
    db.end();
}

test();
