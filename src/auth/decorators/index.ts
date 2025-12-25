/**
 * Auth Decorators
 * Re-export decorators from @thallesp/nestjs-better-auth
 * and define custom permission types for type safety
 */
export {
    Session,
    AllowAnonymous,
    OptionalAuth,
    Roles,
} from '@thallesp/nestjs-better-auth';

export type { UserSession } from '@thallesp/nestjs-better-auth';

/**
 * Permission type for compile-time safety
 * Maps to resources defined in permissions.ts
 */
export type Permission = {
    project?: ('create' | 'read' | 'update' | 'delete' | 'share')[];
    catalog?: ('create' | 'read' | 'update' | 'delete')[];
    organization?: ('create' | 'read' | 'update' | 'delete' | 'manage-members')[];
    user?: ('create' | 'list' | 'set-role' | 'ban' | 'impersonate' | 'delete' | 'set-password')[];
    session?: ('list' | 'revoke' | 'delete')[];
};

/**
 * Role types for compile-time safety
 */
export type Role = 'superadmin' | 'admin' | 'staff' | 'user';
