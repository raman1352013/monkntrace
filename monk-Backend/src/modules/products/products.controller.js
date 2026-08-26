const Product = require('../../models/Product');
const Organization = require('../../models/Organization');

exports.createProduct = async (req, res) => {
  try {
    let { name, sku, code, category, description, organizationId, weightKg, unitWeightKg, functionalUnit, declaredUnit, productionVolumeAnnual, facilityName, manufacturingLocation, city, country } = req.body;

    let targetOrgId = organizationId || req.user?.organizationId;
    if (!targetOrgId) {
      let defaultOrg = await Organization.findOne({ orgType: 'VENDOR' });
      if (!defaultOrg) {
        defaultOrg = await Organization.create({
          name: 'Apex Steel & Materials Ltd',
          code: 'APEX',
          orgType: 'VENDOR',
          status: 'ACTIVE'
        });
      }
      targetOrgId = defaultOrg._id;
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const product = await Product.create({
      name,
      sku: sku || code || name.slice(0, 4).toUpperCase(),
      category: category || 'General',
      description,
      organizationId: targetOrgId,
      weightKg: weightKg || unitWeightKg || 1.0,
      functionalUnit: functionalUnit || '1 unit of product',
      declaredUnit: declaredUnit || '1 kg',
      productionVolumeAnnual: productionVolumeAnnual || 1000,
      manufacturingLocation: typeof manufacturingLocation === 'string'
        ? { city: manufacturingLocation, country: 'India' }
        : { facilityName, city, country }
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.organizationId) {
      filter.organizationId = req.query.organizationId;
    }
    const products = await Product.find(filter).populate('organizationId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('organizationId');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
