require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  let connection;

  try {
    console.log(`Testing connection to ${host}:${port}...`);
    
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 5000 // 5 seconds timeout to quickly detect issues
    });

    console.log('✅ Connection successful!');

    console.log('\nFetching tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables found:', tables);

    // Check if products table exists
    const tableNameKey = `Tables_in_${database}`;
    const hasProducts = tables.some(t => Object.values(t)[0] === 'products');

    if (hasProducts) {
      console.log('\nTable "products" found. Fetching seed data (LIMIT 5)...');
      const [products] = await connection.query('SELECT * FROM products LIMIT 5');
      console.log('Products:', products);
    } else {
      console.log('\nTable "products" not found.');
    }

  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('\n--- Error Details ---');
    console.error('Code:', error.code);
    console.error('Errno:', error.errno);
    console.error('Message:', error.message);

    console.log('\n--- Analysis ---');
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('Possible cause: Firewall/Security Group issue or bind-address configuration problem.');
      console.log('- If EC2/RDS, check if Security Group allows inbound on port 3306 from your IP.');
      console.log('- Check if MySQL server is running and listening on 0.0.0.0 (bind-address setting).');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('Possible cause: Account privilege (GRANT) issue or incorrect credentials.');
      console.log('- Check if the password is correct.');
      console.log(`- Ensure the user '${user}' has access from your current IP (e.g., GRANT ALL PRIVILEGES ON ${database}.* TO '${user}'@'%').`);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log(`Possible cause: The database '${database}' does not exist.`);
    } else {
      console.log('An unknown connection error occurred. Check the error details above.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

testConnection();
