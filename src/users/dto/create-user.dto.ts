import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

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
        description: 'Role ID (UUID)',
    })
    @IsOptional()
    @IsUUID()
    roleId?: string;

    @ApiProperty({
        required: false,
        description: 'Role name (legacy, prefer roleId)',
        deprecated: true,
    })
    @IsOptional()
    @IsString()
    role?: string;
}

