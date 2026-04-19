import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({ description: 'Role name (unique identifier)', example: 'project_manager' })
    @IsString()
    @MaxLength(50)
    name: string;

    @ApiProperty({ description: 'Display name for UI', example: 'Project Manager' })
    @IsString()
    @MaxLength(100)
    displayName: string;

    @ApiPropertyOptional({ description: 'Role description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Permission IDs to assign', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissionIds?: string[];
}
