import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonalTaskCatalogDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    divisionId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    name: string;

    @ApiProperty({ required: false, default: 'TASK' })
    @IsString()
    @IsOptional()
    @MaxLength(24)
    prefix?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;
}
