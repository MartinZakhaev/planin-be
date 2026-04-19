import { ApiProperty } from '@nestjs/swagger';
import { Role as PrismaRole, Permission as PrismaPermission } from '../../generated/prisma/client';

export class PermissionEntity implements Partial<PrismaPermission> {
    @ApiProperty({ description: 'Permission ID' })
    id: string;

    @ApiProperty({ description: 'Resource name (e.g., project, user)' })
    resource: string;

    @ApiProperty({ description: 'Action (e.g., create, read, update, delete)' })
    action: string;

    @ApiProperty({ description: 'Permission description', nullable: true })
    description: string | null;

    constructor(partial: Partial<PermissionEntity>) {
        Object.assign(this, partial);
    }
}

export class RoleEntity implements Partial<PrismaRole> {
    @ApiProperty({ description: 'Role ID' })
    id: string;

    @ApiProperty({ description: 'Role name (unique identifier)' })
    name: string;

    @ApiProperty({ description: 'Display name for UI' })
    displayName: string;

    @ApiProperty({ description: 'Role description', nullable: true })
    description: string | null;

    @ApiProperty({ description: 'Whether this is a protected system role' })
    isSystem: boolean;

    @ApiProperty({ description: 'Created timestamp' })
    createdAt: Date;

    @ApiProperty({ description: 'Updated timestamp' })
    updatedAt: Date;

    @ApiProperty({ description: 'Permissions assigned to this role', type: [PermissionEntity], required: false })
    permissions?: PermissionEntity[];

    @ApiProperty({ description: 'Number of users with this role', required: false })
    userCount?: number;

    constructor(partial: Partial<RoleEntity>) {
        Object.assign(this, partial);
    }
}
