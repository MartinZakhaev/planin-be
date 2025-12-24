import { PartialType } from '@nestjs/swagger';
import { CreateRabExportDto } from './create-rab-export.dto';

export class UpdateRabExportDto extends PartialType(CreateRabExportDto) {}
