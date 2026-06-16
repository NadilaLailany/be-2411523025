const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
  const remoteHost = '34.128.115.154';
  console.log(`Attempting to connect to remote VM Database at ${remoteHost} as root...`);
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: remoteHost,
      user: 'root',
      password: 'KomputasiAwan2026!',
      port: 3306,
      connectTimeout: 10000 // 10s timeout
    });
    console.log('Successfully connected to remote VM MariaDB/MySQL as root!');
  } catch (error) {
    console.error('Failed to connect to remote VM as root. Error:', error.message);
    console.log('\nPossibilities:');
    console.log('1. The VM database port 3306 is not open to the public internet (firewall rule on GCP is missing).');
    console.log('2. The password is not "KomputasiAwan2026!".');
    console.log('3. MariaDB is not configured to allow root connections from remote hosts.');
    process.exit(1);
  }

  try {
    console.log('Creating database db_2411523025...');
    await connection.query('CREATE DATABASE IF NOT EXISTS db_2411523025');
    
    console.log('Creating user user_2411523025...');
    await connection.query("CREATE USER IF NOT EXISTS 'user_2411523025'@'%' IDENTIFIED BY 'KomputasiAwan2026!'");
    await connection.query("ALTER USER 'user_2411523025'@'%' IDENTIFIED BY 'KomputasiAwan2026!'");
    
    console.log('Granting privileges...');
    await connection.query("GRANT ALL PRIVILEGES ON db_2411523025.* TO 'user_2411523025'@'%'");
    await connection.query("FLUSH PRIVILEGES");
    
    console.log('Database and user configured successfully.');
    await connection.end();
  } catch (error) {
    console.error('Error during database/user creation on remote VM:', error.message);
    await connection.end();
    process.exit(1);
  }

  console.log('Connecting to remote VM as user_2411523025 to run init.sql...');
  let userConnection;
  try {
    userConnection = await mysql.createConnection({
      host: remoteHost,
      user: 'user_2411523025',
      password: 'KomputasiAwan2026!',
      database: 'db_2411523025',
      port: 3306,
      multipleStatements: true
    });
    console.log('Connected to remote VM as user_2411523025.');
  } catch (error) {
    console.error('Failed to connect as user_2411523025 on remote VM:', error.message);
    process.exit(1);
  }

  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing init.sql on remote VM...');
    await userConnection.query(sqlContent);
    console.log('init.sql executed successfully on remote VM!');
    
    const [rows] = await userConnection.query('SELECT * FROM skincare');
    console.log('Current skincare records in remote DB:', rows);
    
    await userConnection.end();
    console.log('Remote VM DB Setup Completed successfully!');
  } catch (error) {
    console.error('Error executing init.sql on remote VM:', error.message);
    await userConnection.end();
    process.exit(1);
  }
}

setup();
