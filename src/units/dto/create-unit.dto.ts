import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
    @ApiProperty({ description: 'The unique code of the unit', example: 'M2' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ description: 'The name of the unit', example: 'Square Meter' })
    @IsString()
    @IsNotEmpty()
    name: string;
}
