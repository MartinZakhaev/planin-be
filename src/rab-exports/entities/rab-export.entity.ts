import { RabExport } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RabExportEntity implements RabExport {
    @ApiProperty()
    id: string;

    @ApiProperty()
    rabSummaryId: string;

    @ApiProperty()
    projectId: string;

    @ApiProperty({ required: false, nullable: true })
    pdfFileId: string | null;

    @ApiProperty({ required: false, nullable: true })
    xlsxFileId: string | null;

    @ApiProperty()
    createdAt: Date;

    constructor(partial: Partial<RabExport>) {
        Object.assign(this, partial);
    }
}
