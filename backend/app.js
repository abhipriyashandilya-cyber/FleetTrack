const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require("./routes/tripRoutes");
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const assetDocumentRoutes = require('./routes/assetDocumentRoutes');
const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

// Request logging
app.use(morgan("dev"));

// Parse JSON
app.use(express.json());

// Parse URL encoded data
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FleetTrack API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

const vehicleRoutes = require("./routes/vehicleRoutes");
app.use("/api/vehicles", vehicleRoutes);

app.use('/api/drivers', driverRoutes);

app.use("/api/trips", tripRoutes);

app.use('/api/maintenance', maintenanceRoutes);

app.use('/api/fuel', fuelRoutes);

app.use('/api', assetDocumentRoutes);

module.exports = app;