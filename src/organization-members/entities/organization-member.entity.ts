import { OrganizationMember } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationMemberEntity implements OrganizationMember {
    @ApiProperty()
    id: string;

    @ApiProperty()
    organizationId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({ required: false, nullable: true })
    role: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<OrganizationMemberEntity>) {
        Object.assign(this, partial);
    }
}

