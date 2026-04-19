import { ApiProperty } from '@nestjs/swagger';
import { Permission as PrismaPermission } from '../../generated/prisma/client';

export class PermissionEntity implements Partial<PrismaPermission> {
    @ApiProperty({ description: 'Permission ID' })
    id: string;

    @ApiProperty({ description: 'Resource name (e.g., project, user)' })
    resource: string;

    @ApiProperty({ description: 'Action (e.g., create, read, update, delete)' })
    action: string;

    @ApiProperty({ description: 'Permission description', nullable: true })
    description: string | null;

    @ApiProperty({ description: 'Created timestamp' })
    createdAt: Date;

    constructor(partial: Partial<PermissionEntity>) {
        Object.assign(this, partial);
    }
}
