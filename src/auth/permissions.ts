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
 * SUPERADMIN Role
 * Full system access - can do everything including system configuration
 */
export const superadmin = ac.newRole({
    ...adminAc.statements,
    project: ['create', 'read', 'update', 'delete', 'share'],
    catalog: ['create', 'read', 'update', 'delete'],
    organization: ['create', 'read', 'update', 'delete', 'manage-members'],
});

/**
 * ADMIN Role
 * Organization admin - can manage users and all project operations
 */
export const adminRole = ac.newRole({
    ...adminAc.statements,
    project: ['create', 'read', 'update', 'delete', 'share'],
    catalog: ['create', 'read', 'update', 'delete'],
    organization: ['read', 'update', 'manage-members'],
});

/**
 * STAFF Role
 * Project staff - can work on projects, limited user view
 */
export const staff = ac.newRole({
    project: ['create', 'read', 'update'],
    catalog: ['read'],
    organization: ['read'],
});

/**
 * USER Role
 * Regular user - can only manage their own projects, read catalogs
 */
export const user = ac.newRole({
    project: ['create', 'read'],
    catalog: ['read'],
    organization: ['read'],
});

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
