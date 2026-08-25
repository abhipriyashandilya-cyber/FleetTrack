const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      required: [true, "Please add a trip number"],
      unique: true,
      trim: true,
      uppercase: true
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Please select a vehicle"]
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please select a driver"]
    },

    origin: {
      type: String,
      required: [true, "Please add the trip origin"],
      trim: true
    },

    destination: {
      type: String,
      required: [true, "Please add the trip destination"],
      trim: true
    },

    cargo: {
      description: {
        type: String,
        required: [true, "Please add cargo description"],
        trim: true
      },

      weightKg: {
        type: Number,
        required: [true, "Please add cargo weight"],
        min: [0, "Cargo weight cannot be negative"]
      }
    },

    scheduledDate: {
      type: Date,
      required: [true, "Please add scheduled date"]
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "in-progress",
        "completed",
        "cancelled"
      ],
      default: "scheduled"
    },

    startTime: {
      type: Date,
      default: null
    },

    endTime: {
      type: Date,
      default: null
    },

    notes: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Useful for trip listing and filtering
tripSchema.index({ status: 1, scheduledDate: 1 });

// Useful for checking driver trip history
tripSchema.index({ driver: 1, scheduledDate: 1 });

// Useful for vehicle trip history
tripSchema.index({ vehicle: 1, scheduledDate: 1 });

module.exports = mongoose.model("Trip", tripSchema);