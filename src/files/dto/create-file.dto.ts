import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { FileKind } from '../../generated/prisma/client';

export class CreateFileDto {
    @ApiProperty({ description: 'Owner User ID' })
    @IsUUID()
    @IsNotEmpty()
    ownerUserId: string;

    @ApiProperty({ required: false, description: 'Project ID' })
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @ApiProperty({ required: false, enum: FileKind, default: FileKind.OTHER, description: 'File kind/type' })
    @IsEnum(FileKind)
    @IsOptional()
    kind?: FileKind;

    @ApiProperty({ description: 'Original filename' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(300)
    filename: string;

    @ApiProperty({ required: false, description: 'MIME type' })
    @IsString()
    @IsOptional()
    @MaxLength(150)
    mimeType?: string;

    @ApiProperty({ required: false, description: 'File size in bytes' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    sizeBytes?: number;

    @ApiProperty({ description: 'Storage path' })
    @IsString()
    @IsNotEmpty()
    storagePath: string;
}
