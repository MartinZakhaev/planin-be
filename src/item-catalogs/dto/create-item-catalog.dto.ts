import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ItemType } from '../../generated/prisma/client';

export class CreateItemCatalogDto {
    @ApiProperty({ enum: ItemType })
    @IsEnum(ItemType)
    @IsNotEmpty()
    type: ItemType;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    code: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    name: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    unitId: string;

    @ApiProperty({ default: 0 })
    @IsNumber()
    @Min(0)
    defaultPrice: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;
}

