import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity, PermissionEntity } from './entities/role.entity';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
        const { permissionIds, ...roleData } = createRoleDto;

        const role = await this.prisma.role.create({
            data: {
                ...roleData,
                isSystem: false,
                permissions: permissionIds?.length
                    ? {
                        create: permissionIds.map((permissionId) => ({
                            permissionId,
                        })),
                    }
                    : undefined,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: { users: true },
                },
            },
        });

        return this.mapToEntity(role);
    }

    async findAll(): Promise<RoleEntity[]> {
        const roles = await this.prisma.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: { users: true },
                },
            },
            orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
        });

        return roles.map((role) => this.mapToEntity(role));
    }

    async findOne(id: string): Promise<RoleEntity> {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: { users: true },
                },
            },
        });

        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }

        return this.mapToEntity(role);
    }

    async findByName(name: string): Promise<RoleEntity | null> {
        const role = await this.prisma.role.findUnique({
            where: { name },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: { users: true },
                },
            },
        });

        return role ? this.mapToEntity(role) : null;
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
        const existingRole = await this.prisma.role.findUnique({ where: { id } });

        if (!existingRole) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }

        if (existingRole.isSystem && updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
            throw new BadRequestException('Cannot change the name of a system role');
        }

        const { permissionIds, ...roleData } = updateRoleDto;

        // If permissionIds is provided, update permissions
        if (permissionIds !== undefined) {
            // Remove existing permissions and add new ones
            await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });

            if (permissionIds.length > 0) {
                await this.prisma.rolePermission.createMany({
                    data: permissionIds.map((permissionId) => ({
                        roleId: id,
                        permissionId,
                    })),
                });
            }
        }

        const role = await this.prisma.role.update({
            where: { id },
            data: roleData,
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: { users: true },
                },
            },
        });

        return this.mapToEntity(role);
    }

    async remove(id: string): Promise<RoleEntity> {
        const existingRole = await this.prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        });

        if (!existingRole) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }

        if (existingRole.isSystem) {
            throw new BadRequestException('Cannot delete a system role');
        }

        if (existingRole._count.users > 0) {
            throw new BadRequestException(
                `Cannot delete role with ${existingRole._count.users} assigned users. Reassign users first.`,
            );
        }

        const role = await this.prisma.role.delete({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        return this.mapToEntity(role);
    }

    async assignPermissions(roleId: string, permissionIds: string[]): Promise<RoleEntity> {
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });

        if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
        }

        // Get existing permission IDs for this role
        const existingPermissions = await this.prisma.rolePermission.findMany({
            where: { roleId },
            select: { permissionId: true },
        });
        const existingIds = new Set(existingPermissions.map((p) => p.permissionId));

        // Only add permissions that don't already exist
        const newPermissionIds = permissionIds.filter((id) => !existingIds.has(id));

        if (newPermissionIds.length > 0) {
            await this.prisma.rolePermission.createMany({
                data: newPermissionIds.map((permissionId) => ({
                    roleId,
                    permissionId,
                })),
            });
        }

        return this.findOne(roleId);
    }

    async removePermission(roleId: string, permissionId: string): Promise<RoleEntity> {
        await this.prisma.rolePermission.deleteMany({
            where: {
                roleId,
                permissionId,
            },
        });

        return this.findOne(roleId);
    }

    private mapToEntity(role: any): RoleEntity {
        const permissions = role.permissions?.map(
            (rp: any) =>
                new PermissionEntity({
                    id: rp.permission.id,
                    resource: rp.permission.resource,
                    action: rp.permission.action,
                    description: rp.permission.description,
                }),
        );

        return new RoleEntity({
            id: role.id,
            name: role.name,
            displayName: role.displayName,
            description: role.description,
            isSystem: role.isSystem,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
            permissions,
            userCount: role._count?.users,
        });
    }
}
