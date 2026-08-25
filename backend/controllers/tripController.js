const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const trips = await Trip.find(filter)
      .populate("vehicle", "vin make model licensePlate status")
      .populate("driver", "name email role")
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      status: "success",
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};


// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("vehicle", "vin make model licensePlate status")
      .populate("driver", "name email role");

    if (!trip) {
      return res.status(404).json({
        status: "fail",
        message: "Trip not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};


// @desc    Create new trip
// @route   POST /api/trips
// @access  Private (Admin & Manager)
exports.createTrip = async (req, res) => {
  try {
    const {
      tripNumber,
      vehicle,
      driver,
      origin,
      destination,
      cargo,
      scheduledDate,
      notes
    } = req.body;

    // Validate vehicle
    const vehicleExists = await Vehicle.findById(vehicle);

    if (!vehicleExists) {
      return res.status(400).json({
        status: "fail",
        message: "Vehicle not found"
      });
    }

    // Vehicle should not be decommissioned
    if (vehicleExists.status === "decommissioned") {
      return res.status(400).json({
        status: "fail",
        message: "Cannot create a trip with a decommissioned vehicle"
      });
    }

    // Validate driver
    const driverExists = await User.findById(driver);

    if (!driverExists) {
      return res.status(400).json({
        status: "fail",
        message: "Driver not found"
      });
    }

    // User must actually be a driver
    if (driverExists.role !== "driver") {
      return res.status(400).json({
        status: "fail",
        message: "Selected user is not a driver"
      });
    }

    // Driver must be active
    if (!driverExists.isActive) {
      return res.status(400).json({
        status: "fail",
        message: "Selected driver is inactive"
      });
    }

    // Prevent duplicate trip number
    const existingTrip = await Trip.findOne({ tripNumber });

    if (existingTrip) {
      return res.status(400).json({
        status: "fail",
        message: "Trip number already exists"
      });
    }

    const trip = await Trip.create({
      tripNumber,
      vehicle,
      driver,
      origin,
      destination,
      cargo,
      scheduledDate,
      notes
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle", "vin make model licensePlate status")
      .populate("driver", "name email role");

    res.status(201).json({
      status: "success",
      data: populatedTrip
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        message: "Trip number already exists"
      });
    }

    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};


// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private (Admin & Manager)
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        status: "fail",
        message: "Trip not found"
      });
    }

    // Don't allow modification of completed trips
    if (trip.status === "completed") {
      return res.status(400).json({
        status: "fail",
        message: "Completed trips cannot be modified"
      });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate("vehicle", "vin make model licensePlate status")
      .populate("driver", "name email role");

    res.status(200).json({
      status: "success",
      data: updatedTrip
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};


// @desc    Update trip status
// @route   PATCH /api/trips/:id/status
// @access  Private
exports.updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "scheduled",
      "in-progress",
      "completed",
      "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid trip status"
      });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        status: "fail",
        message: "Trip not found"
      });
    }

    trip.status = status;

    if (status === "in-progress" && !trip.startTime) {
      trip.startTime = new Date();
    }

    if (status === "completed" && !trip.endTime) {
      trip.endTime = new Date();
    }

    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate("vehicle", "vin make model licensePlate status")
      .populate("driver", "name email role");

    res.status(200).json({
      status: "success",
      data: updatedTrip
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};


// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private (Admin only)
// @note    For learning purposes we use hard delete.
//        Later we can introduce soft-delete/audit history.
// @access  Private (Admin only)
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);

    if (!trip) {
      return res.status(404).json({
        status: "fail",
        message: "Trip not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Trip deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};