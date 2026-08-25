const Vehicle = require("../models/Vehicle");

const createVehicle = async (vehicleData) => {
  return await Vehicle.create(vehicleData);
};

const getVehicles = async () => {
  return await Vehicle.find()
    .populate("assignedDriver", "name email role")
    .sort({ createdAt: -1 });
};

const getVehicleById = async (vehicleId) => {
  return await Vehicle.findById(vehicleId)
    .populate("assignedDriver", "name email role");
};

const updateVehicle = async (vehicleId, vehicleData) => {
  return await Vehicle.findByIdAndUpdate(
    vehicleId,
    vehicleData,
    {
      new: true,
      runValidators: true,
    }
  ).populate("assignedDriver", "name email role");
};

const deleteVehicle = async (vehicleId) => {
  return await Vehicle.findByIdAndDelete(vehicleId);
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};