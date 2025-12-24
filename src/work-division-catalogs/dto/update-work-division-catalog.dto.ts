import { PartialType } from '@nestjs/swagger';
import { CreateWorkDivisionCatalogDto } from './create-work-division-catalog.dto';

export class UpdateWorkDivisionCatalogDto extends PartialType(CreateWorkDivisionCatalogDto) {}
