const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetName: {
      type: String,
      required: [true, 'Please provide asset name'],
      trim: true
    },
    category: {
      type: String,
      enum: ['GPS Tracker', 'ELD Unit', 'Refrigeration Unit', 'Dashcam', 'Tool Kit'],
      required: [true, 'Specify asset category']
    },
    serialNumber: {
      type: String,
      required: [true, 'Please provide serial number'],
      unique: true,
      trim: true
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null
    },
    status: {
      type: String,
      enum: ['unassigned', 'assigned', 'in-repair', 'retired'],
      default: 'unassigned'
    },
    purchaseDate: {
      type: Date
    },
    valueAmount: {
      type: Number,
      min: 0
    }
  },
  { timestamps: true }
);

assetSchema.index({ assignedVehicle: 1, status: 1 });

module.exports = mongoose.model('Asset', assetSchema);