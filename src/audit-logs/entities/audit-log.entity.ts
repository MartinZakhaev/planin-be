import { AuditLog } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AuditLogEntity implements Omit<AuditLog, 'meta'> {
    @ApiProperty()
    id: string;

    @ApiProperty({ required: false, nullable: true })
    userId: string | null;

    @ApiProperty({ required: false, nullable: true })
    projectId: string | null;

    @ApiProperty()
    action: string;

    @ApiProperty({ required: false, nullable: true })
    entityTable: string | null;

    @ApiProperty({ required: false, nullable: true })
    entityId: string | null;

    @ApiProperty({ required: false, nullable: true, type: Object })
    meta: any;

    @ApiProperty({ required: false, nullable: true })
    ip: string | null;

    @ApiProperty({ required: false, nullable: true })
    userAgent: string | null;

    @ApiProperty()
    createdAt: Date;

    constructor(partial: Partial<AuditLog>) {
        Object.assign(this, partial);
    }
}
