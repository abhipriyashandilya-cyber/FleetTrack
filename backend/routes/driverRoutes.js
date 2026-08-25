const express = require('express');
const {
  getDrivers,
  getDriverById,
  createDriver,
  upsertDriverProfile,
  updateDriverStatus
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Root Driver collection routes
router.route('/')
  .get(authorize('admin', 'manager'), getDrivers)
  .post(authorize('admin', 'manager'), createDriver);

// Individual Driver routes
router.get('/:id', getDriverById);
router.post('/:id/profile', authorize('admin', 'manager'), upsertDriverProfile);
router.patch('/:id/status', updateDriverStatus);

module.exports = router;