const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Role = require('../models/Role');
const Organization = require('../models/Organization');
const logger = require('../config/logger');

const defaultUsers = [
  {
    email: 'admin@monktrace.com',
    password: 'Admin123!@#',
    firstName: 'Super',
    lastName: 'Admin',
    phoneNumber: '9876543210',
    userType: 'SUPER_ADMIN',
    roleName: 'SUPERADMIN'
  },
  {
    email: 'reviewer@monktrace.com',
    password: 'Reviewer123!@#',
    firstName: 'LCA',
    lastName: 'Auditor',
    phoneNumber: '9876543211',
    userType: 'REVIEWER',
    roleName: 'REVIEWER'
  },
  {
    email: 'vendor@company.com',
    password: 'Vendor@123',
    firstName: 'Apex',
    lastName: 'Supplier',
    phoneNumber: '9876543212',
    userType: 'VENDOR',
    roleName: 'VENDOR'
  }
];

async function seedData() {
  try {
    logger.info('Data Seeding: Connecting to database...');
    await connectDB();
    logger.info('Data Seeding: Connected.');

    // 1. Ensure Default Vendor Organization
    let sampleOrg = await Organization.findOne({ contactEmail: 'vendor@company.com' });
    if (!sampleOrg) {
      sampleOrg = await Organization.create({
        name: 'Apex Steel & Materials Ltd',
        code: 'APEX-001',
        orgType: 'VENDOR',
        contactEmail: 'vendor@company.com',
        contactPhone: '9876543212',
        address: { city: 'Mumbai', country: 'India' },
        status: 'ACTIVE'
      });
    }

    // 2. Seed Default Users
    for (const u of defaultUsers) {
      const existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        const roleObj = await Role.findOne({ name: u.roleName });
        await User.create({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          passwordHash: u.password,
          phoneNumber: u.phoneNumber,
          userType: u.userType,
          roleId: roleObj?._id,
          organizationId: sampleOrg._id,
          status: 'ACTIVE',
          emailVerified: true
        });
        logger.info(`Seeded user: ${u.email}`);
      }
    }

    logger.info('Data Seeding completed successfully!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    logger.error('Data Seeding failed', { error: error.message });
    if (require.main === module) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  seedData();
} else {
  module.exports = seedData;
}
