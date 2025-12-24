import { ProjectCollaborator } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectCollaboratorEntity implements ProjectCollaborator {
    @ApiProperty()
    id: string;

    @ApiProperty()
    projectId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({ required: false, nullable: true })
    role: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<ProjectCollaboratorEntity>) {
        Object.assign(this, partial);
    }
}

