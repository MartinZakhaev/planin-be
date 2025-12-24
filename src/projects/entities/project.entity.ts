import { Project } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectEntity implements Project {
    @ApiProperty()
    id: string;

    @ApiProperty()
    organizationId: string;

    @ApiProperty()
    ownerUserId: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false, nullable: true })
    code: string | null;

    @ApiProperty({ required: false, nullable: true })
    description: string | null;

    @ApiProperty({ required: false, nullable: true })
    location: string | null;

    @ApiProperty({ type: Number })
    taxRatePercent: any;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<ProjectEntity>) {
        Object.assign(this, partial);
    }
}

