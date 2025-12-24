import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectCollaboratorDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ default: 'EDITOR' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    role?: string;
}

