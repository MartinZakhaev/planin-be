import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../generated/prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @Exclude()
    passwordHash: string;

    @ApiProperty({ required: false, nullable: true })
    fullName: string | null;

    @ApiProperty({ required: false, nullable: true })
    profileFileId: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
