const mongoose = require('mongoose');
const connectDB = require('../config/database');
const UserType = require('../models/UserType');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const logger = require('../config/logger');

const userTypes = [
  { name: 'SUPER_ADMIN', description: 'Platform Super Administrator' },
  { name: 'ADMIN', description: 'Environmental Platform Administrator' },
  { name: 'VENDOR', description: 'Supply Chain Partner / Vendor Representative' },
  { name: 'REVIEWER', description: 'Internal LCA Auditor / Verifier' }
];

const roles = [
  { name: 'SUPERADMIN', description: 'Root admin with total system privileges' },
  { name: 'ADMIN', description: 'General Administrator' },
  { name: 'VENDOR', description: 'Vendor User - data entry and questionnaire responder' },
  { name: 'REVIEWER', description: 'LCA Reviewer - inspects, flags, and verifies activity datasets' }
];

const modules = ['VENDORS', 'PRODUCTS', 'LCA_PROJECTS', 'REVIEWS', 'USERS', 'ROLES'];
const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'];

async function seedRbac() {
  try {
    logger.info('RBAC Seeding: Connecting to database...');
    await connectDB();
    logger.info('RBAC Seeding: Connected.');

    // 1. Seed UserTypes
    logger.info('RBAC Seeding: Seeding UserTypes...');
    const seededUserTypes = {};
    for (const ut of userTypes) {
      let existing = await UserType.findOne({ name: ut.name });
      if (!existing) {
        existing = await UserType.create(ut);
      }
      seededUserTypes[ut.name] = existing._id;
    }
    logger.info('RBAC Seeding: UserTypes completed.');

    // 2. Seed Roles
    logger.info('RBAC Seeding: Seeding Roles...');
    const seededRoles = {};
    for (const r of roles) {
      let existing = await Role.findOne({ name: r.name });
      if (!existing) {
        existing = await Role.create({
          name: r.name,
          description: r.description,
          isActive: true,
          isSystem: true
        });
      }
      seededRoles[r.name] = existing._id;
    }
    logger.info('RBAC Seeding: Roles completed.');

    // 3. Seed Permissions
    logger.info('RBAC Seeding: Seeding Permissions...');
    const seededPermissions = {};
    for (const mod of modules) {
      for (const act of actions) {
        const permName = `${act}_${mod}`;
        const description = `Can ${act.toLowerCase()} ${mod.toLowerCase()}`;
        let existing = await Permission.findOne({ name: permName });
        if (!existing) {
          existing = await Permission.create({
            name: permName,
            description,
            resource: mod,
            action: act,
            isActive: true
          });
        }
        seededPermissions[permName] = existing._id;
      }
    }
    logger.info('RBAC Seeding: Permissions completed.');

    // 4. Map RolePermissions
    logger.info('RBAC Seeding: Mapping RolePermissions...');
    
    const mapPermissionsToRole = async (roleName, permissionNames) => {
      const roleId = seededRoles[roleName];
      if (!roleId) return;

      for (const pName of permissionNames) {
        const permissionId = seededPermissions[pName];
        if (!permissionId) continue;

        const exists = await RolePermission.findOne({ roleId, permissionId });
        if (!exists) {
          await RolePermission.create({
            roleId,
            permissionId,
            isActive: true
          });
        }
      }
    };

    const allPermNames = Object.keys(seededPermissions);
    await mapPermissionsToRole('SUPERADMIN', allPermNames);
    await mapPermissionsToRole('ADMIN', allPermNames);

    const vendorPerms = allPermNames.filter(name => 
      name.includes('_LCA_PROJECTS') || 
      name.includes('_PRODUCTS') || 
      name.startsWith('READ_')
    );
    await mapPermissionsToRole('VENDOR', vendorPerms);

    const reviewerPerms = allPermNames.filter(name => 
      name.includes('_REVIEWS') || 
      name.includes('_LCA_PROJECTS') ||
      name.startsWith('READ_')
    );
    await mapPermissionsToRole('REVIEWER', reviewerPerms);

    logger.info('RBAC Seeding completed successfully for LCA Platform!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    logger.error('RBAC Seeding failed', { error: error.message });
    if (require.main === module) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  seedRbac();
} else {
  module.exports = seedRbac;
}
