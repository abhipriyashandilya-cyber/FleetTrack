const { pool } = require('../config/db.sql');

// @desc    Log a new fuel refill entry
// @route   POST /api/fuel
// @access  Private (Admin, Manager, Driver)
exports.logFuel = async (req, res) => {
  try {
    const { vehicle_vin, driver_id, fuel_gallons, price_per_gallon, odometer_reading, logged_at } = req.body;

    if (!vehicle_vin || !driver_id || !fuel_gallons || !price_per_gallon || !odometer_reading) {
      return res.status(400).json({ status: 'fail', message: 'Please provide all required fuel log fields' });
    }

    const total_cost = (parseFloat(fuel_gallons) * parseFloat(price_per_gallon)).toFixed(2);
    const timestamp = logged_at ? new Date(logged_at) : new Date();

    const query = `
      INSERT INTO fuel_logs 
      (vehicle_vin, driver_id, fuel_gallons, price_per_gallon, total_cost, odometer_reading, logged_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      vehicle_vin,
      driver_id,
      fuel_gallons,
      price_per_gallon,
      total_cost,
      odometer_reading,
      timestamp
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        id: result.insertId,
        vehicle_vin,
        driver_id,
        fuel_gallons,
        price_per_gallon,
        total_cost,
        odometer_reading,
        logged_at: timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get fuel logs for a vehicle (ordered chronologically)
// @route   GET /api/fuel/vehicle/:vin
// @access  Private
exports.getFuelLogsByVehicle = async (req, res) => {
  try {
    const { vin } = req.params;

    const query = `
      SELECT * FROM fuel_logs 
      WHERE vehicle_vin = ? 
      ORDER BY logged_at DESC
    `;

    const [rows] = await pool.execute(query, [vin]);

    res.status(200).json({
      status: 'success',
      count: rows.length,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get monthly expense analytics per vehicle
// @route   GET /api/fuel/analytics/summary
// @access  Private (Admin & Manager)
exports.getFuelAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT 
        vehicle_vin,
        COUNT(*) as total_refills,
        SUM(fuel_gallons) as total_gallons,
        SUM(total_cost) as total_expenditure,
        AVG(price_per_gallon) as avg_price_per_gallon
      FROM fuel_logs
      GROUP BY vehicle_vin
      ORDER BY total_expenditure DESC
    `;

    const [rows] = await pool.execute(query);

    res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};