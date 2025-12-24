import { Plan } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class PlanEntity implements Plan {
    @ApiProperty()
    id: string;

    @ApiProperty()
    code: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    priceCents: number;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    interval: string;

    @ApiProperty()
    maxProjects: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<PlanEntity>) {
        Object.assign(this, partial);
    }
}

