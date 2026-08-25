const express = require('express');
const {
  getMaintenanceLogs,
  createMaintenanceLog,
  updateMaintenanceStatus,
  getMaintenanceCostSummary
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/costs/summary', authorize('admin', 'manager'), getMaintenanceCostSummary);

router
  .route('/')
  .get(getMaintenanceLogs)
  .post(authorize('admin', 'manager'), createMaintenanceLog);

router
  .route('/:id/status')
  .patch(authorize('admin', 'manager'), updateMaintenanceStatus);

module.exports = router;