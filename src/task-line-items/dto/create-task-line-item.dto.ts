import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateTaskLineItemDto {
    @ApiProperty({ description: 'Project ID' })
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({ description: 'Project Task ID' })
    @IsUUID()
    @IsNotEmpty()
    projectTaskId: string;

    @ApiProperty({ description: 'Item Catalog ID' })
    @IsUUID()
    @IsNotEmpty()
    itemCatalogId: string;

    @ApiProperty({ description: 'Unit ID' })
    @IsUUID()
    @IsNotEmpty()
    unitId: string;

    @ApiProperty({ required: false, description: 'Description of the line item' })
    @IsString()
    @IsOptional()
    @MaxLength(300)
    description?: string;

    @ApiProperty({ default: 0, description: 'Quantity' })
    @IsNumber()
    @Min(0)
    quantity: number;

    @ApiProperty({ default: 0, description: 'Unit price' })
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiProperty({ required: false, default: true, description: 'Whether item is taxable' })
    @IsBoolean()
    @IsOptional()
    taxable?: boolean;
}
