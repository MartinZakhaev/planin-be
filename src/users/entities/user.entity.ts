import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../generated/prisma/client';

/**
 * User Entity for API responses
 * Note: Password is now stored in the Account table (managed by Better Auth)
 */
export class UserEntity implements User {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    emailVerified: boolean;

    @ApiProperty({ required: false, nullable: true })
    fullName: string | null;

    @ApiProperty({ required: false, nullable: true })
    image: string | null;

    @ApiProperty({ required: false, nullable: true })
    profileFileId: string | null;

    @ApiProperty({ description: 'User role: superadmin, admin, staff, or user' })
    role: string;

    @ApiProperty()
    banned: boolean;

    @ApiProperty({ required: false, nullable: true })
    banReason: string | null;

    @ApiProperty({ required: false, nullable: true })
    banExpires: Date | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
