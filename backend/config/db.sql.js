const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fleettrack_sql',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initSQLDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('[MariaDB/MySQL] Connected successfully to pool');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS fuel_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_vin VARCHAR(17) NOT NULL,
        driver_id VARCHAR(50) NOT NULL,
        fuel_gallons DECIMAL(8, 2) NOT NULL,
        price_per_gallon DECIMAL(6, 2) NOT NULL,
        total_cost DECIMAL(10, 2) NOT NULL,
        odometer_reading INT NOT NULL,
        logged_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_fuel_vehicle_date (vehicle_vin, logged_at DESC)
      );
    `);

    console.log('[MariaDB/MySQL] Schema initialized (fuel_logs table verified)');
    connection.release();
  } catch (error) {
    console.error(`[MariaDB/MySQL] Warning: Could not connect to MySQL service on 3306 (${error.message})`);
  }
};

module.exports = { pool, initSQLDatabase };