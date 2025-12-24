import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @MaxLength(80)
    code?: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    ownerUserId: string;
}

