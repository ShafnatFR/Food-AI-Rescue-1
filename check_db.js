const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: 'c:/Tel-U/JagoAI/far/server/.env' });

async function check() {
  console.log('Connecting to:', process.env.DB_NAME);
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('Connection successful!');
    
    const [rows] = await connection.query('SHOW TABLES LIKE "users"');
    if (rows.length > 0) {
      console.log('Table "users" exists.');
      const [desc] = await connection.query('DESCRIBE users');
      console.log('Columns:', desc.map(c => c.Field).join(', '));
    } else {
      console.log('Table "users" DOES NOT exist.');
    }
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
