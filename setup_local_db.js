const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
  console.log('Starting local DB setup...');
  
  // 1. Connect as root with no password
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      port: 3306
    });
    console.log('Connected to MariaDB/MySQL as root.');
  } catch (error) {
    console.error('Failed to connect as root:', error.message);
    process.exit(1);
  }

  try {
    // 2. Create database and user
    console.log('Creating database db_2411523025...');
    await connection.query('CREATE DATABASE IF NOT EXISTS db_2411523025');
    
    console.log('Creating user user_2411523025...');
    // Create user if not exists and grant privileges
    await connection.query("CREATE USER IF NOT EXISTS 'user_2411523025'@'%' IDENTIFIED BY 'KomputasiAwan2026!'");
    await connection.query("ALTER USER 'user_2411523025'@'%' IDENTIFIED BY 'KomputasiAwan2026!'");
    
    console.log('Granting privileges...');
    await connection.query("GRANT ALL PRIVILEGES ON db_2411523025.* TO 'user_2411523025'@'%'");
    await connection.query("FLUSH PRIVILEGES");
    
    console.log('Database and user configured successfully.');
    await connection.end();
  } catch (error) {
    console.error('Error during database/user creation:', error.message);
    await connection.end();
    process.exit(1);
  }

  // 3. Connect as user_2411523025 and run init.sql
  console.log('Connecting as user_2411523025 to initialize tables...');
  let userConnection;
  try {
    userConnection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'user_2411523025',
      password: 'KomputasiAwan2026!',
      database: 'db_2411523025',
      port: 3306,
      multipleStatements: true // Allow executing init.sql with multiple statements
    });
    console.log('Connected as user_2411523025.');
  } catch (error) {
    console.error('Failed to connect as user_2411523025:', error.message);
    process.exit(1);
  }

  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing init.sql...');
    await userConnection.query(sqlContent);
    console.log('init.sql executed successfully.');
    
    // Verify by listing rows
    const [rows] = await userConnection.query('SELECT * FROM skincare');
    console.log('Current skincare records in DB:', rows);
    
    await userConnection.end();
    console.log('Local DB Setup Completed successfully!');
  } catch (error) {
    console.error('Error executing init.sql:', error.message);
    await userConnection.end();
    process.exit(1);
  }
}

setup();
