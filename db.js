const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'user_2411523025',
  password: process.env.DB_PASSWORD || 'KomputasiAwan2026!',
  database: process.env.DB_NAME || 'db_2411523025',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Database Configuration loaded:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Helper to check DB connection status
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  checkConnection
};
