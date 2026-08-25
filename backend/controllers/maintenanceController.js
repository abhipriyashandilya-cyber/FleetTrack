const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenanceLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;
    if (req.query.status) filter.status = req.query.status;

    const logs = await Maintenance.find(filter)
      .populate('vehicle', 'vin make model licensePlate status')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      status: 'success',
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Schedule new maintenance task
// @route   POST /api/maintenance
// @access  Private (Admin & Manager)
exports.createMaintenanceLog = async (req, res) => {
  try {
    const { vehicle: vehicleId, serviceType, description, cost, scheduledDate, status } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ status: 'fail', message: 'Vehicle not found' });
    }

    const log = await Maintenance.create({
      vehicle: vehicleId,
      serviceType,
      description,
      cost,
      scheduledDate,
      status: status || 'scheduled'
    });

    if (log.status === 'in-progress') {
      await Vehicle.findByIdAndUpdate(vehicleId, { status: 'in-service' });
    }

    res.status(201).json({
      status: 'success',
      data: log
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update maintenance status
// @route   PATCH /api/maintenance/:id/status
// @access  Private (Admin & Manager)
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid maintenance status' });
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completedDate = new Date();
    }

    const log = await Maintenance.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!log) {
      return res.status(404).json({ status: 'fail', message: 'Maintenance record not found' });
    }

    if (status === 'in-progress') {
      await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'in-service' });
    } else if (status === 'completed' || status === 'cancelled') {
      await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'active' });
    }

    res.status(200).json({
      status: 'success',
      data: log
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get total maintenance cost summary by vehicle
// @route   GET /api/maintenance/costs/summary
// @access  Private (Admin & Manager)
exports.getMaintenanceCostSummary = async (req, res) => {
  try {
    const summary = await Maintenance.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$vehicle',
          totalCost: { $sum: '$cost' },
          totalServices: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicleInfo'
        }
      },
      { $unwind: '$vehicleInfo' },
      {
        $project: {
          _id: 1,
          totalCost: 1,
          totalServices: 1,
          vin: '$vehicleInfo.vin',
          make: '$vehicleInfo.make',
          model: '$vehicleInfo.model',
          licensePlate: '$vehicleInfo.licensePlate'
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};