import { ItemCatalog, ItemType } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ItemCatalogEntity implements ItemCatalog {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ItemType })
    type: ItemType;

    @ApiProperty()
    code: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    unitId: string;

    @ApiProperty({ type: Number })
    defaultPrice: any;

    @ApiProperty({ required: false, nullable: true })
    description: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<ItemCatalogEntity>) {
        Object.assign(this, partial);
    }
}

