import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    organizationId: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    ownerUserId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @MaxLength(80)
    code?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @MaxLength(250)
    location?: string;

    @ApiProperty({ default: 11.00 })
    @IsNumber()
    @Min(0)
    taxRatePercent: number;

    @ApiProperty({ default: 'IDR' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    currency: string;
}

