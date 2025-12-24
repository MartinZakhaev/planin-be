import { IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDivisionDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    divisionId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    displayName: string;

    @ApiProperty({ default: 0 })
    @IsNumber()
    @Min(0)
    sortOrder: number;
}

