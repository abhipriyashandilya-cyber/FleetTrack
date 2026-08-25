require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { initSQLDatabase } = require("./config/db.sql");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect MongoDB Atlas
  await connectDB();

  // Initialize MariaDB/MySQL pool & create fuel_logs table
  await initSQLDatabase();

  app.listen(PORT, () => {
    console.log(`[Server] FleetTrack API running on http://localhost:${PORT}`);
  });
};

startServer();