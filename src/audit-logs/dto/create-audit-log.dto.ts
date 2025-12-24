import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAuditLogDto {
    @ApiProperty({ required: false, description: 'User ID who performed the action' })
    @IsUUID()
    @IsOptional()
    userId?: string;

    @ApiProperty({ required: false, description: 'Project ID if action is project-related' })
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @ApiProperty({ description: 'Action performed' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    action: string;

    @ApiProperty({ required: false, description: 'Entity table name' })
    @IsString()
    @IsOptional()
    @MaxLength(120)
    entityTable?: string;

    @ApiProperty({ required: false, description: 'Entity ID' })
    @IsUUID()
    @IsOptional()
    entityId?: string;

    @ApiProperty({ required: false, description: 'Additional metadata as JSON' })
    @IsObject()
    @IsOptional()
    meta?: Record<string, any>;

    @ApiProperty({ required: false, description: 'IP address' })
    @IsString()
    @IsOptional()
    ip?: string;

    @ApiProperty({ required: false, description: 'User agent string' })
    @IsString()
    @IsOptional()
    userAgent?: string;
}
