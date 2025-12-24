import { IsNotEmpty, IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskCatalogDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    divisionId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    code: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;
}

