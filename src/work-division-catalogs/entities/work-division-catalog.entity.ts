import { WorkDivisionCatalog } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class WorkDivisionCatalogEntity implements WorkDivisionCatalog {
    @ApiProperty()
    id: string;

    @ApiProperty()
    code: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false, nullable: true })
    description: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<WorkDivisionCatalogEntity>) {
        Object.assign(this, partial);
    }
}

