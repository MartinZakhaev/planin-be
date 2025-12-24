import { Organization } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationEntity implements Organization {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false, nullable: true })
    code: string | null;

    @ApiProperty()
    ownerUserId: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<OrganizationEntity>) {
        Object.assign(this, partial);
    }
}

