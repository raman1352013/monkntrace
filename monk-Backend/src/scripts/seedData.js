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

    // 3. Seed Sample Product & LCA Project Container
    const Product = require('../models/Product');
    const LcaProject = require('../models/LcaProject');
    const { calculateLciaImpacts } = require('../services/lciaCalculator.service');

    let sampleProduct = await Product.findOne({ organizationId: sampleOrg._id });
    if (!sampleProduct) {
      sampleProduct = await Product.create({
        organizationId: sampleOrg._id,
        name: 'Stainless Steel Water Bottle 750ml',
        sku: 'SKU-BOT-750',
        category: 'Consumer Goods / Packaging',
        weightKg: 0.45,
        functionalUnit: '1 bottle over 5 years reuse',
        declaredUnit: '1 unit',
        productionVolumeAnnual: 50000,
        status: 'ACTIVE'
      });
      logger.info('Seeded sample product: Stainless Steel Water Bottle 750ml');
    }

    let sampleProject = await LcaProject.findOne({ productId: sampleProduct._id });
    if (!sampleProject) {
      const rawData = {
        title: 'LCA Study - Stainless Steel Water Bottle 750ml',
        productId: sampleProduct._id,
        vendorId: sampleOrg._id,
        systemBoundary: 'CRADLE_TO_GATE',
        functionalUnit: '1 bottle over 5 years reuse',
        status: 'SUBMITTED',
        currentStep: 7,
        materials: [
          { materialName: 'Stainless Steel 304', quantity: 0.38, unit: 'kg', recycledContentPct: 35, supplierName: 'Jindal Stainless Ltd', originCountry: 'India' },
          { materialName: 'PP Plastic Lid', quantity: 0.05, unit: 'kg', recycledContentPct: 20, supplierName: 'Polymer Corp', originCountry: 'India' },
          { materialName: 'Silicone Seal Ring', quantity: 0.02, unit: 'kg', recycledContentPct: 0, supplierName: 'Silicone Tech', originCountry: 'India' }
        ],
        manufacturing: {
          electricityKwh: 4.5,
          electricitySource: 'GRID_MIX',
          naturalGasM3: 0.2,
          dieselLiters: 0.1,
          waterConsumptionLiters: 15,
          processWastewaterLiters: 12
        },
        transportation: [
          { legType: 'RAW_MATERIAL_INBOUND', mode: 'TRUCK_DIESEL', distanceKm: 450, weightTons: 0.00045 }
        ],
        packaging: [
          { packagingType: 'CARDBOARD_BOX', weightGramsPerUnit: 45, recycledContentPct: 80, disposalRoute: 'RECYCLED' }
        ],
        wasteEmissions: [
          { wasteType: 'SCRAP_METAL', quantityKg: 0.03, treatmentMethod: 'RECYCLING', directCo2eKg: 0.05 }
        ]
      };

      const computedLcia = calculateLciaImpacts(rawData);

      sampleProject = await LcaProject.create({
        ...rawData,
        lciaResults: computedLcia,
        submittedAt: new Date()
      });
      logger.info('Seeded sample LCA project: Stainless Steel Water Bottle');
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
