const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vin: {
      type: String,
      required: [true, 'Please add a Vehicle Identification Number (VIN)'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [17, 'VIN must be exactly 17 characters'],
      maxlength: [17, 'VIN must be exactly 17 characters']
    },
    make: {
      type: String,
      required: [true, 'Please add a vehicle make (e.g., Volvo, Ford)']
    },
    model: {
      type: String,
      required: [true, 'Please add a vehicle model']
    },
    year: {
      type: Number,
      required: [true, 'Please add a manufacturing year']
    },
    licensePlate: {
      type: String,
      required: [true, 'Please add a license plate number'],
      unique: true,
      trim: true,
      uppercase: true
    },
    status: {
      type: String,
      enum: ['active', 'in-service', 'decommissioned'],
      default: 'active'
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    fuelType: {
      type: String,
      enum: ['diesel', 'gasoline', 'electric', 'hybrid'],
      default: 'diesel'
    },
    odometerMiles: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Compound Indexes for Milestone 11 Query Optimization
vehicleSchema.index({ status: 1, assignedDriver: 1 });
vehicleSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);