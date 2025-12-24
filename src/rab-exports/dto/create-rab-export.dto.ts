import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateRabExportDto {
    @ApiProperty({ description: 'RAB Summary ID' })
    @IsUUID()
    @IsNotEmpty()
    rabSummaryId: string;

    @ApiProperty({ description: 'Project ID' })
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({ required: false, description: 'PDF File ID' })
    @IsUUID()
    @IsOptional()
    pdfFileId?: string;

    @ApiProperty({ required: false, description: 'XLSX File ID' })
    @IsUUID()
    @IsOptional()
    xlsxFileId?: string;
}
