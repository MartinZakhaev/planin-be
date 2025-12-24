import { TaskCatalog } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TaskCatalogEntity implements TaskCatalog {
    @ApiProperty()
    id: string;

    @ApiProperty()
    divisionId: string;

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

    constructor(partial: Partial<TaskCatalogEntity>) {
        Object.assign(this, partial);
    }
}

