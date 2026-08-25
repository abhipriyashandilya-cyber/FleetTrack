const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a document title'],
      trim: true
    },
    documentType: {
      type: String,
      enum: ['Insurance', 'Registration', 'Medical Card', 'Inspection Report', 'CDL Copy', 'Other'],
      required: [true, 'Please specify document type']
    },
    fileUrl: {
      type: String,
      required: [true, 'Please provide document file URL or path']
    },
    entityType: {
      type: String,
      enum: ['Vehicle', 'Driver'],
      required: [true, 'Specify entity type (Vehicle or Driver)']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Provide referenced entity ID']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please specify document expiration date']
    },
    status: {
      type: String,
      enum: ['valid', 'expiring-soon', 'expired'],
      default: 'valid'
    }
  },
  { timestamps: true }
);

documentSchema.index({ expiryDate: 1, status: 1 });

module.exports = mongoose.model('Document', documentSchema);