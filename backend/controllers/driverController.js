const User = require('../models/User');
const DriverProfile = require('../models/DriverProfile');
const Vehicle = require('../models/Vehicle');

// @desc    Get all drivers with their profiles & assigned vehicles
// @route   GET /api/drivers
// @access  Private (Admin & Manager)
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');

    const driverIds = drivers.map((d) => d._id);
    const profiles = await DriverProfile.find({ user: { $in: driverIds } });
    const vehicles = await Vehicle.find({ assignedDriver: { $in: driverIds } });

    const formattedDrivers = drivers.map((driver) => {
      const profile = profiles.find((p) => p.user.toString() === driver._id.toString());
      const vehicle = vehicles.find((v) => v.assignedDriver?.toString() === driver._id.toString());

      return {
        driver,
        profile: profile || null,
        assignedVehicle: vehicle || null
      };
    });

    res.status(200).json({
      status: 'success',
      count: formattedDrivers.length,
      data: formattedDrivers
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Create a new driver (User account + Profile) in one step
// @route   POST /api/drivers
// @access  Private (Admin & Manager)
exports.createDriver = async (req, res) => {
  try {
    const { name, email, password, licenseNumber, licenseClass, licenseExpiry, status, safetyScore } = req.body;

    // 1. Create User with 'driver' role
    const user = await User.create({
      name,
      email,
      password: password || 'FleetDriver123!',
      role: 'driver'
    });

    // 2. Create associated DriverProfile
    const profile = await DriverProfile.create({
      user: user._id,
      licenseNumber,
      licenseClass: licenseClass || 'Class A CDL',
      licenseExpiry,
      status: status || 'available',
      safetyScore: safetyScore || 100
    });

    res.status(201).json({
      status: 'success',
      data: {
        driver: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get single driver by ID
// @route   GET /api/drivers/:id
// @access  Private
exports.getDriverById = async (req, res) => {
  try {
    const driver = await User.findById(req.params.id).select('-password');
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ status: 'fail', message: 'Driver not found' });
    }

    const profile = await DriverProfile.findOne({ user: driver._id });
    const vehicle = await Vehicle.findOne({ assignedDriver: driver._id });

    res.status(200).json({
      status: 'success',
      data: {
        driver,
        profile: profile || null,
        assignedVehicle: vehicle || null
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Create or Update Driver Profile (License, Safety Score, etc.)
// @route   POST /api/drivers/:id/profile
// @access  Private (Admin & Manager)
exports.upsertDriverProfile = async (req, res) => {
  try {
    const driver = await User.findById(req.params.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ status: 'fail', message: 'Driver user not found' });
    }

    const { licenseNumber, licenseClass, licenseExpiry, status, safetyScore, medicalClearanceDate } = req.body;

    let profile = await DriverProfile.findOne({ user: req.params.id });

    if (profile) {
      profile = await DriverProfile.findOneAndUpdate(
        { user: req.params.id },
        { licenseNumber, licenseClass, licenseExpiry, status, safetyScore, medicalClearanceDate },
        { new: true, runValidators: true }
      );
    } else {
      profile = await DriverProfile.create({
        user: req.params.id,
        licenseNumber,
        licenseClass,
        licenseExpiry,
        status,
        safetyScore,
        medicalClearanceDate
      });
    }

    res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update Driver Availability Status
// @route   PATCH /api/drivers/:id/status
// @access  Private (Admin, Manager, Driver self)
exports.updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['available', 'on-trip', 'suspended', 'off-duty'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid driver status' });
    }

    const profile = await DriverProfile.findOneAndUpdate(
      { user: req.params.id },
      { status },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ status: 'fail', message: 'Driver profile not found. Create profile first.' });
    }

    res.status(200).json({ status: 'success', data: profile });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};