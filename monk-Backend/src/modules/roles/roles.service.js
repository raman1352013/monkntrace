const Role = require('../../models/Role');
const logger = require('../../config/logger');

class RolesService {
  /**
   * Get all roles
   */
  async getRoles(filters = {}) {
    const { organizationId, includeInactive = false } = filters;

    let query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    }
    if (!includeInactive) {
      query.isActive = true;
    }

    const roles = await Role.find(query).populate('organizationId', 'name');

    return roles;
  }

  /**
   * Get role by name
   */
  async getRoleByName(name) {
    const role = await Role.findOne({ name: name.toUpperCase() }).populate('organizationId', 'name');

    if (!role) {
      throw new Error('Role not found');
    }

    return role;
  }

  /**
   * Create a new role
   */
  async createRole(roleData, creatorId = null) {
    const { name, description, permissions, organizationId } = roleData;

    const roleNameUpper = name.toUpperCase();
    const existingRole = await Role.findOne({ name: roleNameUpper });
    if (existingRole) {
      throw new Error('Role with this name already exists');
    }

    const role = new Role({
      name: roleNameUpper,
      description,
      permissions,
      organizationId,
    });

    await role.save();

    logger.info('Role created successfully', {
      roleId: role._id,
      name: role.name,
      creatorId,
    });

    return role;
  }

  /**
   * Update role
   */
  async updateRole(name, updateData, updaterId = null) {
    const { description, permissions, isActive } = updateData;

    const role = await Role.findOne({ name: name.toUpperCase() });
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.name === 'SUPERADMIN') {
      throw new Error('Cannot modify SUPERADMIN role');
    }

    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();

    logger.info('Role updated successfully', {
      roleId: role._id,
      name: role.name,
      updaterId,
    });

    return role;
  }

  /**
   * Delete/deactivate role
   */
  async deleteRole(name, deleterId = null) {
    const role = await Role.findOne({ name: name.toUpperCase() });
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.name === 'SUPERADMIN') {
      throw new Error('Cannot delete SUPERADMIN role');
    }

    role.isActive = false;
    await role.save();

    logger.info('Role deactivated successfully', {
      roleId: role._id,
      name: role.name,
      deleterId,
    });

    return role;
  }

  /**
   * Get available permissions list for LCA Platform
   */
  getAvailablePermissions() {
    return [
      { category: 'vendors', permissions: ['vendors:create', 'vendors:read', 'vendors:update', 'vendors:delete'] },
      { category: 'products', permissions: ['products:create', 'products:read', 'products:update', 'products:delete'] },
      { category: 'lca-projects', permissions: ['lca:create', 'lca:read', 'lca:update', 'lca:delete'] },
      { category: 'reviews', permissions: ['reviews:create', 'reviews:read', 'reviews:update', 'reviews:approve'] },
      { category: 'users', permissions: ['users:create', 'users:read', 'users:update', 'users:delete'] },
      { category: 'roles', permissions: ['roles:create', 'roles:read', 'roles:update', 'roles:delete'] },
    ];
  }

  /**
   * Initialize default roles for LCA Platform
   */
  async initializeDefaultRoles() {
    const defaultRoles = [
      {
        name: 'SUPERADMIN',
        description: 'Platform Super Administrator with full system access',
        permissions: this.getAllPermissions(),
        isSystem: true
      },
      {
        name: 'ADMIN',
        description: 'LCA Platform Administrator with full access to vendors and studies',
        permissions: [
          'vendors:create', 'vendors:read', 'vendors:update', 'vendors:delete',
          'products:create', 'products:read', 'products:update', 'products:delete',
          'lca:create', 'lca:read', 'lca:update', 'lca:delete',
          'reviews:create', 'reviews:read', 'reviews:update', 'reviews:approve',
          'users:create', 'users:read', 'users:update',
          'roles:read'
        ],
        isSystem: true
      },
      {
        name: 'REVIEWER',
        description: 'Internal LCA Auditor / Verifier for line-item study audit',
        permissions: [
          'vendors:read',
          'products:read',
          'lca:read', 'lca:update',
          'reviews:create', 'reviews:read', 'reviews:update', 'reviews:approve'
        ],
        isSystem: true
      },
      {
        name: 'VENDOR',
        description: 'Supply Chain Partner / Vendor Representative for data questionnaire response',
        permissions: [
          'products:create', 'products:read', 'products:update',
          'lca:create', 'lca:read', 'lca:update'
        ],
        isSystem: true
      }
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        logger.info('Default LCA role created', { roleName: roleData.name });
      }
    }
  }

  /**
   * Get all available permissions
   */
  getAllPermissions() {
    const permissions = this.getAvailablePermissions();
    return permissions.flatMap(category => category.permissions);
  }
}

module.exports = new RolesService();
