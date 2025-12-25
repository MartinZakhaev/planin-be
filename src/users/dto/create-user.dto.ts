import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, IsIn } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ required: false, description: 'User full name' })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({ required: false, description: 'Profile file ID (UUID)' })
    @IsOptional()
    @IsUUID()
    profileFileId?: string;

    @ApiProperty({
        required: false,
        description: 'User role',
        enum: ['superadmin', 'admin', 'staff', 'user'],
        default: 'user',
    })
    @IsOptional()
    @IsIn(['superadmin', 'admin', 'staff', 'user'])
    role?: string;
}
