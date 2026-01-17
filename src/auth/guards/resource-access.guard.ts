import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_ACCESS_KEY, AccessCheckConfig } from '../decorators/check-access.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES } from '../permissions';

/**
 * ResourceAccessGuard
 * 
 * Checks if the current user has access to the requested resource.
 * Access is granted if:
 * 1. User is superadmin (bypass all checks)
 * 2. User is the owner of the resource
 * 3. User is a collaborator on the resource (for projects)
 * 4. User is a member of the organization that owns the resource
 */
@Injectable()
export class ResourceAccessGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const accessConfig = this.reflector.getAllAndOverride<AccessCheckConfig>(CHECK_ACCESS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // No @CheckAccess decorator, allow through
        if (!accessConfig) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Superadmins bypass all ownership checks
        if (user.role === ROLES.SUPERADMIN) {
            return true;
        }

        const idParam = accessConfig.idParam || 'id';
        const resourceId = request.params[idParam];

        if (!resourceId) {
            // No resource ID in params, allow through (might be a list endpoint)
            return true;
        }

        const { resourceType } = accessConfig;

        if (resourceType === 'project') {
            return this.checkProjectAccess(user.id, resourceId);
        }

        if (resourceType === 'organization') {
            return this.checkOrganizationAccess(user.id, resourceId);
        }

        return true;
    }

    /**
     * Check if user has access to a project
     * Access granted if: owner, collaborator, or org member
     */
    private async checkProjectAccess(userId: string, projectId: string): Promise<boolean> {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                collaborators: {
                    where: { userId },
                },
                organization: {
                    include: {
                        members: {
                            where: { userId },
                        },
                    },
                },
            },
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        }

        // Check 1: Is user the project owner?
        if (project.ownerUserId === userId) {
            return true;
        }

        // Check 2: Is user a collaborator on this project?
        if (project.collaborators.length > 0) {
            return true;
        }

        // Check 3: Is user a member of the organization?
        if (project.organization.members.length > 0) {
            return true;
        }

        // Check 4: Is user the organization owner?
        if (project.organization.ownerUserId === userId) {
            return true;
        }

        throw new ForbiddenException('You do not have access to this project');
    }

    /**
     * Check if user has access to an organization
     * Access granted if: owner or member
     */
    private async checkOrganizationAccess(userId: string, organizationId: string): Promise<boolean> {
        const organization = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            include: {
                members: {
                    where: { userId },
                },
            },
        });

        if (!organization) {
            throw new NotFoundException(`Organization with ID ${organizationId} not found`);
        }

        // Check 1: Is user the organization owner?
        if (organization.ownerUserId === userId) {
            return true;
        }

        // Check 2: Is user a member of the organization?
        if (organization.members.length > 0) {
            return true;
        }

        throw new ForbiddenException('You do not have access to this organization');
    }
}
