import { File, FileKind } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class FileEntity implements File {
    @ApiProperty()
    id: string;

    @ApiProperty()
    ownerUserId: string;

    @ApiProperty({ required: false, nullable: true })
    projectId: string | null;

    @ApiProperty({ enum: FileKind })
    kind: FileKind;

    @ApiProperty()
    filename: string;

    @ApiProperty({ required: false, nullable: true })
    mimeType: string | null;

    @ApiProperty({ type: Number, required: false, nullable: true })
    sizeBytes: bigint | null;

    @ApiProperty()
    storagePath: string;

    @ApiProperty()
    createdAt: Date;

    constructor(partial: Partial<File>) {
        Object.assign(this, partial);
        // Convert BigInt to Number for JSON serialization
        if (partial.sizeBytes !== undefined && partial.sizeBytes !== null) {
            (this as any).sizeBytes = Number(partial.sizeBytes);
        }
    }
}
