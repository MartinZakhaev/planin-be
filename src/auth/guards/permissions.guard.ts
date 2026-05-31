import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionRequirement } from '../decorators/require-permission.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES } from '../permissions';

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

        let role = userWithRole.role;

        // Backfill legacy signups that were created before default role assignment existed.
        if (!role) {
            const defaultRoleName = process.env.DEFAULT_SIGNUP_ROLE || ROLES.USER;
            const defaultRole = await this.prisma.role.findUnique({
                where: { name: defaultRoleName },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });

            if (!defaultRole) {
                throw new ForbiddenException(`Default signup role "${defaultRoleName}" is not configured`);
            }

            await this.prisma.user.update({
                where: { id: userWithRole.id },
                data: { roleId: defaultRole.id },
            });
            role = defaultRole;
        }

        const roleName = role.name;
        const userPermissions = role.permissions.map(rp => ({
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
