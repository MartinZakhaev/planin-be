import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionRequirement } from '../decorators/require-permission.decorator';
import { rolePermissions } from '../permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermission = this.reflector.getAllAndOverride<PermissionRequirement>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermission) {
            return true;
        }

        const { resource, action } = requiredPermission;
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }

        // Default to 'user' role if none specified
        const role = (user.role || 'user') as string;

        // Get permissions for this role
        const permissions = rolePermissions[role];

        if (!permissions) {
            // If role is unknown, deny access implicitly
            console.warn(`Role ${role} is not defined in permissions map`);
            return false;
        }

        const resourcePermissions = permissions[resource];

        // Check if user has permission for this resource
        if (!resourcePermissions) {
            // No permissions at all for this resource
            return false;
        }

        // Check specific action
        if (!resourcePermissions.includes(action)) {
            throw new ForbiddenException(`User with role ${role} does not have permission to ${action} ${resource}`);
        }

        return true;
    }
}
