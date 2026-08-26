const mongoose = require('mongoose');

const reviewCommentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LcaProject',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  section: {
    type: String,
    enum: ['GENERAL', 'MATERIALS', 'MANUFACTURING', 'TRANSPORT', 'PACKAGING', 'WASTE', 'DOCUMENTS'],
    default: 'GENERAL'
  },
  fieldKey: {
    type: String,
    trim: true
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'RESOLVED', 'REJECTED'],
    default: 'OPEN'
  },
  vendorResponse: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReviewComment', reviewCommentSchema);
