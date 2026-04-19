import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionRequirement } from '../decorators/require-permission.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

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

        // Get user with role and permissions from database
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!userWithRole) {
            throw new UnauthorizedException('User not found');
        }

        // If user has no role, deny access
        if (!userWithRole.role) {
            throw new ForbiddenException('User has no assigned role');
        }

        const roleName = userWithRole.role.name;
        const userPermissions = userWithRole.role.permissions.map(rp => ({
            resource: rp.permission.resource,
            action: rp.permission.action,
        }));

        // Check if user has the required permission
        const hasPermission = userPermissions.some(
            p => p.resource === resource && p.action === action
        );

        if (!hasPermission) {
            throw new ForbiddenException(
                `User with role ${roleName} does not have permission to ${action} ${resource}`
            );
        }

        return true;
    }
}

