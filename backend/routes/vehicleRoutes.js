const express = require('express');
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  assignDriver,
  deleteVehicle
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all vehicle routes
router.use(protect);

router
  .route('/')
  .get(getVehicles)
  .post(authorize('admin', 'manager'), createVehicle);

router
  .route('/:id')
  .get(getVehicleById)
  .put(authorize('admin', 'manager'), updateVehicle)
  .delete(authorize('admin'), deleteVehicle);

router
  .route('/:id/assign-driver')
  .patch(authorize('admin', 'manager'), assignDriver);

module.exports = router;