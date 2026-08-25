const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// @desc    Get all vehicles (with optional status filter)
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const vehicles = await Vehicle.find(filter)
      .populate('assignedDriver', 'name email role');

    res.status(200).json({
      status: 'success',
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get single vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('assignedDriver', 'name email role');

    if (!vehicle) {
      return res.status(404).json({ status: 'fail', message: 'Vehicle not found' });
    }

    res.status(200).json({ status: 'success', data: vehicle });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin & Manager)
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      status: 'success',
      data: vehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vehicle with this VIN or License Plate already exists'
      });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update vehicle details
// @route   PUT /api/vehicles/:id
// @access  Private (Admin & Manager)
exports.updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ status: 'fail', message: 'Vehicle not found' });
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: vehicle });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Assign driver to vehicle
// @route   PATCH /api/vehicles/:id/assign-driver
// @access  Private (Admin & Manager)
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    if (driverId) {
      const driver = await User.findById(driverId);
      if (!driver || driver.role !== 'driver') {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid user or user is not a driver'
        });
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { assignedDriver: driverId || null },
      { new: true }
    ).populate('assignedDriver', 'name email role');

    if (!vehicle) {
      return res.status(404).json({ status: 'fail', message: 'Vehicle not found' });
    }

    res.status(200).json({ status: 'success', data: vehicle });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin only)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ status: 'fail', message: 'Vehicle not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Vehicle removed from fleet'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};