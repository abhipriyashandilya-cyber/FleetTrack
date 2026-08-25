const mongoose = require('mongoose');

const driverProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please add a commercial driver license number'],
      unique: true,
      uppercase: true,
      trim: true
    },
    licenseClass: {
      type: String,
      enum: ['Class A', 'Class B', 'Class C'],
      default: 'Class A'
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'Please add license expiration date']
    },
    status: {
      type: String,
      enum: ['available', 'on-trip', 'suspended', 'off-duty'],
      default: 'available'
    },
    safetyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    medicalClearanceDate: {
      type: Date
    }
  },
  { timestamps: true }
);

driverProfileSchema.index({ status: 1 });

module.exports = mongoose.model('DriverProfile', driverProfileSchema);