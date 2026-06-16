const mysql = require('mysql2/promise');

async function test() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'foodairescue'
    });

    const [rows] = await db.query('SHOW TRIGGERS');
    console.log(rows);
    
    db.end();
}

test();
