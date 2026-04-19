import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionEntity } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<PermissionEntity[]> {
        const permissions = await this.prisma.permission.findMany({
            orderBy: [{ resource: 'asc' }, { action: 'asc' }],
        });

        return permissions.map(
            (p) =>
                new PermissionEntity({
                    id: p.id,
                    resource: p.resource,
                    action: p.action,
                    description: p.description,
                    createdAt: p.createdAt,
                }),
        );
    }

    async findByResourceAction(resource: string, action: string): Promise<PermissionEntity | null> {
        const permission = await this.prisma.permission.findUnique({
            where: {
                resource_action: { resource, action },
            },
        });

        return permission
            ? new PermissionEntity({
                id: permission.id,
                resource: permission.resource,
                action: permission.action,
                description: permission.description,
                createdAt: permission.createdAt,
            })
            : null;
    }

    /**
     * Get permissions grouped by resource for easier UI rendering
     */
    async findAllGrouped(): Promise<Record<string, PermissionEntity[]>> {
        const permissions = await this.findAll();
        const grouped: Record<string, PermissionEntity[]> = {};

        for (const permission of permissions) {
            if (!grouped[permission.resource]) {
                grouped[permission.resource] = [];
            }
            grouped[permission.resource].push(permission);
        }

        return grouped;
    }
}
