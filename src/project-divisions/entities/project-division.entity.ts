import { ProjectDivision } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectDivisionEntity implements ProjectDivision {
    @ApiProperty()
    id: string;

    @ApiProperty()
    projectId: string;

    @ApiProperty()
    divisionId: string;

    @ApiProperty()
    displayName: string;

    @ApiProperty()
    sortOrder: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<ProjectDivisionEntity>) {
        Object.assign(this, partial);
    }
}

