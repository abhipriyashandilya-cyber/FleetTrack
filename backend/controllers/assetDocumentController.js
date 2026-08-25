const Document = require('../models/Document');
const Asset = require('../models/Asset');

// @desc    Upload / Register new compliance document
// @route   POST /api/documents
// @access  Private (Admin & Manager)
exports.createDocument = async (req, res) => {
  try {
    const { title, documentType, fileUrl, entityType, entityId, expiryDate } = req.body;

    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysDiff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    let status = 'valid';
    if (daysDiff <= 0) {
      status = 'expired';
    } else if (daysDiff <= 30) {
      status = 'expiring-soon';
    }

    const doc = await Document.create({
      title,
      documentType,
      fileUrl,
      entityType,
      entityId,
      expiryDate: expiry,
      status
    });

    res.status(201).json({ status: 'success', data: doc });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get expiring documents (Alerts within threshold)
// @route   GET /api/documents/alerts
// @access  Private
exports.getExpiringDocuments = async (req, res) => {
  try {
    const thresholdDays = parseInt(req.query.days) || 30;

    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + thresholdDays);

    // Find documents expiring between now and threshold date, OR explicitly flagged
    const documents = await Document.find({
      $or: [
        { status: { $in: ['expiring-soon', 'expired'] } },
        { expiryDate: { $lte: alertDate } }
      ]
    }).sort({ expiryDate: 1 });

    res.status(200).json({
      status: 'success',
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Register new physical asset
// @route   POST /api/assets
// @access  Private (Admin & Manager)
exports.createAsset = async (req, res) => {
  try {
    const { assetName, category, serialNumber, assignedVehicle, purchaseDate, valueAmount } = req.body;

    const status = assignedVehicle ? 'assigned' : 'unassigned';

    const asset = await Asset.create({
      assetName,
      category,
      serialNumber,
      assignedVehicle: assignedVehicle || null,
      status,
      purchaseDate,
      valueAmount
    });

    res.status(201).json({ status: 'success', data: asset });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all assets (populated with assigned vehicle details)
// @route   GET /api/assets
// @access  Private
exports.getAssets = async (req, res) => {
  try {
    const assets = await Asset.find()
      .populate('assignedVehicle', 'vin make model licensePlate')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', count: assets.length, data: assets });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};