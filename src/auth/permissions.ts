import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

/**
 * Access Control Statement Definition
 * Defines all resources and their available actions
 */
export const statement = {
    ...defaultStatements,
    project: ['create', 'read', 'update', 'delete', 'share'],
    // Granular Catalog permissions
    unit: ['create', 'read', 'update', 'delete'],
    work_division: ['create', 'read', 'update', 'delete'],
    task_catalog: ['create', 'read', 'update', 'delete'],
    item_catalog: ['create', 'read', 'update', 'delete'],
    // Organization & System permissions
    organization: ['create', 'read', 'update', 'delete', 'manage-members'],
    audit_log: ['create', 'read', 'update', 'delete'],
    subscription: ['create', 'read', 'update', 'delete'],
    plan: ['create', 'read', 'update', 'delete'],
    user: ['create', 'read', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statement);

/**
 * SUPERADMIN Role Permissions
 */
const superadminPermissions = {
    ...adminAc.statements,
    project: ['create', 'read', 'update', 'delete', 'share'],
    organization: ['create', 'read', 'update', 'delete', 'manage-members'],
    user: ['create', 'read', 'update', 'delete'],
    // Full access to everything
    unit: ['create', 'read', 'update', 'delete'],
    work_division: ['create', 'read', 'update', 'delete'],
    task_catalog: ['create', 'read', 'update', 'delete'],
    item_catalog: ['create', 'read', 'update', 'delete'],
    audit_log: ['create', 'read', 'update', 'delete'],
    subscription: ['create', 'read', 'update', 'delete'],
    plan: ['create', 'read', 'update', 'delete'],
};

export const superadmin = ac.newRole(superadminPermissions as any);

/**
 * ADMIN Role Permissions
 */
const adminPermissions = {
    ...adminAc.statements,
    project: ['create', 'read', 'update', 'delete', 'share'],
    organization: ['read', 'update', 'manage-members'],
    // Granular catalog access
    unit: ['create', 'read', 'update', 'delete'],
    work_division: ['create', 'read', 'update', 'delete'],
    task_catalog: ['create', 'read', 'update', 'delete'],
    item_catalog: ['create', 'read', 'update', 'delete'],
    // System access
    audit_log: ['read'],
    subscription: ['read', 'update'],
    plan: ['read'],
    user: ['read', 'create', 'update', 'delete'], // Admins manage users
};

export const adminRole = ac.newRole(adminPermissions as any);

/**
 * STAFF Role Permissions
 */
const staffPermissions = {
    project: ['create', 'read', 'update'],
    organization: ['read'],
    // Read-only catalog
    unit: ['read'],
    work_division: ['read'],
    task_catalog: ['read'],
    item_catalog: ['read'],
    plan: ['read'],
};

export const staff = ac.newRole(staffPermissions as any);

/**
 * USER Role Permissions
 */
const userPermissions = {
    project: ['create', 'read', 'update', 'delete'],
    organization: ['read'],
    // Read-only catalog
    unit: ['read'],
    work_division: ['read'],
    task_catalog: ['read'],
    item_catalog: ['read'],
    plan: ['read'],
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
