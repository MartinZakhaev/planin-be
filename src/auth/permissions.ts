import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

/**
 * Access Control Statement Definition
 * Defines all resources and their available actions
 */
export const statement = {
    ...defaultStatements,
    // Project resource permissions
    project: ['create', 'read', 'update', 'delete', 'share'],
    // Catalog resource permissions (units, divisions, tasks, items)
    catalog: ['create', 'read', 'update', 'delete'],
    // Organization resource permissions
    organization: ['create', 'read', 'update', 'delete', 'manage-members'],
} as const;

/**
 * Create the Access Controller
 */
export const ac = createAccessControl(statement);

/**
 * SUPERADMIN Role Permissions
 */
const superadminPermissions = {
    ...adminAc.statements,
    project: ['create', 'read', 'update', 'delete', 'share'],
    catalog: ['create', 'read', 'update', 'delete'],
    organization: ['create', 'read', 'update', 'delete', 'manage-members'],
};

export const superadmin = ac.newRole(superadminPermissions as any);

/**
 * ADMIN Role Permissions
 */
const adminPermissions = {
    ...adminAc.statements,
    project: ['create', 'read', 'update', 'delete', 'share'],
    catalog: ['create', 'read', 'update', 'delete'],
    organization: ['read', 'update', 'manage-members'],
};

export const adminRole = ac.newRole(adminPermissions as any);

/**
 * STAFF Role Permissions
 */
const staffPermissions = {
    project: ['create', 'read', 'update'],
    catalog: ['read'],
    organization: ['read'],
};

export const staff = ac.newRole(staffPermissions as any);

/**
 * USER Role Permissions
 */
const userPermissions = {
    project: ['create', 'read'],
    catalog: ['read'],
    organization: ['read'],
};

export const user = ac.newRole(userPermissions as any);

/**
 * Role names mapping for type safety
 */
export const ROLES = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    STAFF: 'staff',
    USER: 'user',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * Map of role permissions for Guards
 */
export const rolePermissions: Record<string, any> = {
    [ROLES.SUPERADMIN]: superadminPermissions,
    [ROLES.ADMIN]: adminPermissions,
    [ROLES.STAFF]: staffPermissions,
    [ROLES.USER]: userPermissions,
};
