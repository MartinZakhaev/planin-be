import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectTaskDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    projectDivisionId: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    taskCatalogId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    displayName: string;

    @ApiProperty({ default: 0 })
    @IsNumber()
    @Min(0)
    sortOrder: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}

