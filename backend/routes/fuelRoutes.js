const express = require('express');
const {
  logFuel,
  getFuelLogsByVehicle,
  getFuelAnalytics
} = require('../controllers/fuelController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/analytics/summary', authorize('admin', 'manager'), getFuelAnalytics);
router.post('/', logFuel);
router.get('/vehicle/:vin', getFuelLogsByVehicle);

module.exports = router;