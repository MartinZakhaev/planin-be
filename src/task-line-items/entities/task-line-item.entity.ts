import { TaskLineItem } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TaskLineItemEntity implements TaskLineItem {
    @ApiProperty()
    id: string;

    @ApiProperty()
    projectId: string;

    @ApiProperty()
    projectTaskId: string;

    @ApiProperty()
    itemCatalogId: string;

    @ApiProperty()
    unitId: string;

    @ApiProperty({ required: false, nullable: true })
    description: string | null;

    @ApiProperty({ type: Number })
    quantity: any;

    @ApiProperty({ type: Number })
    unitPrice: any;

    @ApiProperty({ type: Number })
    lineTotal: any;

    @ApiProperty({ required: false, nullable: true })
    taxable: boolean | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<TaskLineItem>) {
        Object.assign(this, partial);
    }
}
