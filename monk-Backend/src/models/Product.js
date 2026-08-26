const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  description: {
    type: String,
    trim: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  weightKg: {
    type: Number,
    default: 1.0
  },
  functionalUnit: {
    type: String,
    default: '1 unit of product'
  },
  declaredUnit: {
    type: String,
    default: '1 kg'
  },
  productionVolumeAnnual: {
    type: Number,
    default: 1000
  },
  manufacturingLocation: {
    facilityName: String,
    city: String,
    country: String
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'ARCHIVED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
