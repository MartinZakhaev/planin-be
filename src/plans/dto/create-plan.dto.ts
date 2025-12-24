import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    name: string;

    @ApiProperty()
    @IsInt()
    @Min(0)
    priceCents: number;

    @ApiProperty({ required: false, default: 'IDR' })
    @IsString()
    @IsOptional()
    @MaxLength(10)
    currency?: string;

    @ApiProperty({ required: false, default: 'monthly' })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    interval?: string;

    @ApiProperty({ required: false, default: 10 })
    @IsInt()
    @IsOptional()
    @Min(0)
    maxProjects?: number;
}

