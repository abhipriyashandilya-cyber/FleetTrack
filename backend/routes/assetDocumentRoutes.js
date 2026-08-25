const express = require('express');
const {
  createDocument,
  getExpiringDocuments,
  createAsset,
  getAssets
} = require('../controllers/assetDocumentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Document Routes
router.post('/documents', authorize('admin', 'manager'), createDocument);
router.get('/documents/alerts', getExpiringDocuments);

// Asset Routes
router.post('/assets', authorize('admin', 'manager'), createAsset);
router.get('/assets', getAssets);

module.exports = router;