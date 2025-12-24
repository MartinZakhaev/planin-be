import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRabSummaryDto {
    @ApiProperty({ description: 'Project ID' })
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({ description: 'Creator User ID' })
    @IsUUID()
    @IsNotEmpty()
    createdBy: string;

    @ApiProperty({ required: false, default: 1, description: 'Version number' })
    @IsNumber()
    @IsOptional()
    @Min(1)
    version?: number;

    @ApiProperty({ required: false, default: 0, description: 'Subtotal for materials' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    subtotalMaterial?: number;

    @ApiProperty({ required: false, default: 0, description: 'Subtotal for manpower' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    subtotalManpower?: number;

    @ApiProperty({ required: false, default: 0, description: 'Subtotal for tools' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    subtotalTools?: number;

    @ApiProperty({ required: false, default: 0, description: 'Taxable subtotal' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    taxableSubtotal?: number;

    @ApiProperty({ required: false, default: 0, description: 'Non-taxable subtotal' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    nontaxSubtotal?: number;

    @ApiProperty({ required: false, default: 11.00, description: 'Tax rate percentage' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    taxRatePercent?: number;

    @ApiProperty({ required: false, default: 0, description: 'Tax amount' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    taxAmount?: number;

    @ApiProperty({ required: false, default: 0, description: 'Grand total' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    grandTotal?: number;

    @ApiProperty({ required: false, description: 'Notes' })
    @IsString()
    @IsOptional()
    notes?: string;
}
