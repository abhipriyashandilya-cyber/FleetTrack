const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Please select a vehicle']
    },
    serviceType: {
      type: String,
      required: [true, 'Please specify the service type (e.g., Oil Change, Tire Rotation, Brake Service)'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    cost: {
      type: Number,
      required: [true, 'Please enter service cost'],
      min: [0, 'Cost cannot be negative']
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please select a scheduled date']
    },
    completedDate: {
      type: Date,
      default: null
    },
    performedBy: {
      type: String,
      trim: true,
      default: 'Internal Fleet Service'
    }
  },
  { timestamps: true }
);

// Optimized compound index for historical service queries per vehicle
maintenanceSchema.index({ vehicle: 1, scheduledDate: -1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);