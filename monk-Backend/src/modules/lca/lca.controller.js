const LcaProject = require('../../models/LcaProject');
const Product = require('../../models/Product');
const Organization = require('../../models/Organization');

const normalizeSystemBoundary = (val) => {
  if (!val) return 'CRADLE_TO_GATE';
  const str = String(val).toUpperCase().replace(/[\s-]/g, '_');
  if (['CRADLE_TO_GATE', 'CRADLE_TO_GRAVE', 'GATE_TO_GATE'].includes(str)) {
    return str;
  }
  return 'CRADLE_TO_GATE';
};

// Create new LCA Project
exports.createLcaProject = async (req, res) => {
  try {
    let { title, productId, vendorId, systemBoundary } = req.body;

    let targetVendorId = vendorId || req.user?.organizationId;

    if (!targetVendorId && productId) {
      const prod = await Product.findById(productId);
      if (prod?.organizationId) {
        targetVendorId = prod.organizationId;
      }
    }

    if (!targetVendorId) {
      let defaultOrg = await Organization.findOne({ orgType: 'VENDOR' });
      if (!defaultOrg) {
        defaultOrg = await Organization.create({
          name: 'Apex Steel & Materials Ltd',
          code: 'APEX',
          orgType: 'VENDOR',
          status: 'ACTIVE'
        });
      }
      targetVendorId = defaultOrg._id;
    }

    if (!title || !productId) {
      return res.status(400).json({ success: false, message: 'Title and productId are required' });
    }

    const project = await LcaProject.create({
      title,
      productId,
      vendorId: targetVendorId,
      systemBoundary: normalizeSystemBoundary(systemBoundary),
      status: 'DRAFT',
      currentStep: 1
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('createLcaProject Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all LCA projects
exports.getLcaProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vendorId) filter.vendorId = req.query.vendorId;
    if (req.query.status) filter.status = req.query.status;

    const projects = await LcaProject.find(filter)
      .populate('productId')
      .populate('vendorId')
      .populate('assignedReviewerId', 'firstName lastName email')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single LCA project by ID
exports.getLcaProjectById = async (req, res) => {
  try {
    const project = await LcaProject.findById(req.params.id)
      .populate({ path: 'productId', populate: { path: 'organizationId' } })
      .populate('vendorId')
      .populate('assignedReviewerId', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'LCA Project not found' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update LCA Project section
exports.updateLcaProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.systemBoundary) {
      updateData.systemBoundary = normalizeSystemBoundary(updateData.systemBoundary);
    }

    if (updateData.status === 'SUBMITTED') {
      updateData.submittedAt = new Date();
      updateData.status = 'UNDER_REVIEW';
    }

    const project = await LcaProject.findByIdAndUpdate(id, updateData, { new: true, runValidators: false })
      .populate('productId')
      .populate('vendorId');

    if (!project) {
      return res.status(404).json({ success: false, message: 'LCA Project not found' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('updateLcaProject Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit LCA Project for Reviewer Audit
exports.submitLcaProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await LcaProject.findByIdAndUpdate(
      id,
      {
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      { new: true }
    ).populate('productId').populate('vendorId');

    if (!project) {
      return res.status(404).json({ success: false, message: 'LCA Project not found' });
    }

    res.status(200).json({ success: true, message: 'LCA project submitted for auditor review', data: project });
  } catch (error) {
    console.error('submitLcaProject Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
