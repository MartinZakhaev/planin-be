import { ProjectTask } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectTaskEntity implements Omit<ProjectTask, 'rowVersion'> {
    @ApiProperty()
    id: string;

    @ApiProperty()
    projectId: string;

    @ApiProperty()
    projectDivisionId: string;

    @ApiProperty()
    taskCatalogId: string;

    @ApiProperty()
    displayName: string;

    @ApiProperty()
    sortOrder: number;

    @ApiProperty({ required: false, nullable: true })
    notes: string | null;

    @ApiProperty({ type: Number, description: 'Row version for optimistic locking' })
    rowVersion: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<ProjectTask>) {
        Object.assign(this, partial);
        // Convert BigInt to Number for JSON serialization
        if (partial.rowVersion !== undefined && partial.rowVersion !== null) {
            this.rowVersion = Number(partial.rowVersion);
        }
    }
}

