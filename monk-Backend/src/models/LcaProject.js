const mongoose = require('mongoose');

const lcaProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  assignedReviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  systemBoundary: {
    type: String,
    enum: ['CRADLE_TO_GATE', 'CRADLE_TO_GRAVE', 'GATE_TO_GATE'],
    default: 'CRADLE_TO_GATE'
  },
  status: {
    type: String,
    enum: ['INVITED', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CORRECTIONS_REQUIRED', 'APPROVED', 'LCA_COMPLETED'],
    default: 'DRAFT'
  },
  currentStep: {
    type: Number,
    default: 1
  },
  
  // Section 1: Materials
  materials: [{
    materialName: String,
    quantity: Number,
    unit: { type: String, default: 'kg' },
    recycledContentPct: { type: Number, default: 0 },
    supplierName: String,
    originCountry: String,
    transportDistanceKm: Number
  }],

  // Section 2: Manufacturing & Energy Utilities
  manufacturing: {
    electricityKwh: { type: Number, default: 0 },
    electricitySource: { type: String, default: 'GRID_MIX' },
    naturalGasM3: { type: Number, default: 0 },
    dieselLiters: { type: Number, default: 0 },
    waterConsumptionLiters: { type: Number, default: 0 },
    processWastewaterLiters: { type: Number, default: 0 }
  },

  // Section 3: Transportation & Logistics
  transportation: [{
    legType: { type: String, default: 'RAW_MATERIAL_INBOUND' },
    mode: { type: String, default: 'TRUCK_DIESEL' },
    distanceKm: Number,
    weightTons: Number
  }],

  // Section 4: Packaging
  packaging: [{
    packagingType: String,
    weightGramsPerUnit: Number,
    recycledContentPct: Number,
    disposalRoute: String
  }],

  // Section 5: Waste & Direct Emissions
  wasteEmissions: [{
    wasteType: String,
    quantityKg: Number,
    treatmentMethod: String,
    directCo2eKg: Number
  }],

  // Section 6: Documents
  documents: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  submittedAt: Date,
  approvedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('LcaProject', lcaProjectSchema);
