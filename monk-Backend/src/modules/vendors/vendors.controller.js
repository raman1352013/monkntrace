const Organization = require('../../models/Organization');
const User = require('../../models/User');
const Role = require('../../models/Role');
const bcrypt = require('bcryptjs');

// Onboard new vendor company and create vendor user account
exports.onboardVendor = async (req, res) => {
  try {
    const { name, code, contactEmail, contactPhone, street, city, state, country, postalCode, vendorPassword, contactFirstName, contactLastName } = req.body;

    if (!name || !contactEmail) {
      return res.status(400).json({ success: false, message: 'Organization name and contact email are required' });
    }

    // 1. Create Organization
    const existingOrg = await Organization.findOne({ contactEmail });
    if (existingOrg) {
      return res.status(400).json({ success: false, message: 'Vendor organization with this email already exists' });
    }

    const org = await Organization.create({
      name,
      code: code || name.slice(0, 4).toUpperCase(),
      orgType: 'VENDOR',
      contactEmail,
      contactPhone,
      address: { street, city, state, country, postalCode },
      status: 'ACTIVE'
    });

    // 2. Find VENDOR Role ObjectId
    const vendorRole = await Role.findOne({ name: 'VENDOR' });

    // 3. Create User Account for Vendor
    const password = vendorPassword || 'Vendor@123';
    const user = await User.create({
      firstName: contactFirstName || 'Vendor',
      lastName: contactLastName || 'Representative',
      email: contactEmail,
      passwordHash: password,
      phoneNumber: contactPhone,
      userType: 'VENDOR',
      roleId: vendorRole?._id,
      organizationId: org._id,
      status: 'ACTIVE',
      emailVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'Vendor onboarded successfully',
      data: {
        organization: org,
        vendorUser: {
          id: user._id,
          email: user.email,
          userType: user.userType,
          roleId: user.roleId,
          initialPassword: password
        }
      }
    });
  } catch (error) {
    console.error('onboardVendor Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// List all vendors
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Organization.find({ orgType: 'VENDOR' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single vendor details
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Organization.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    const users = await User.find({ organizationId: vendor._id }).populate('roleId');
    res.status(200).json({ success: true, data: { organization: vendor, users } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
