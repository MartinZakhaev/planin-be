import { RabSummary } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RabSummaryEntity implements RabSummary {
    @ApiProperty()
    id: string;

    @ApiProperty()
    projectId: string;

    @ApiProperty()
    version: number;

    @ApiProperty({ type: Number })
    subtotalMaterial: any;

    @ApiProperty({ type: Number })
    subtotalManpower: any;

    @ApiProperty({ type: Number })
    subtotalTools: any;

    @ApiProperty({ type: Number })
    taxableSubtotal: any;

    @ApiProperty({ type: Number })
    nontaxSubtotal: any;

    @ApiProperty({ type: Number })
    taxRatePercent: any;

    @ApiProperty({ type: Number })
    taxAmount: any;

    @ApiProperty({ type: Number })
    grandTotal: any;

    @ApiProperty({ required: false, nullable: true })
    notes: string | null;

    @ApiProperty()
    createdBy: string;

    @ApiProperty()
    createdAt: Date;

    constructor(partial: Partial<RabSummary>) {
        Object.assign(this, partial);
    }
}
