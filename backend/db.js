const mysql = require('mysql2');

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'manish',
    database: process.env.DB_NAME || 'smart_billing_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export a promise-based pool for async/await usage
const promisePool = pool.promise();

module.exports = promisePool;
