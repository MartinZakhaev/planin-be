import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationMemberDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    organizationId: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ required: false, default: 'MEMBER' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    role?: string;
}

