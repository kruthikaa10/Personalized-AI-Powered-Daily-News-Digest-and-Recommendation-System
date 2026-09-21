const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        requestTimeout: 60000 // 60 seconds
    },
    pool: {
        max: 50,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL successfully!');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Please check your SQL Server password and TCP/IP settings.');
    });

module.exports = {
    sql, poolPromise
};

