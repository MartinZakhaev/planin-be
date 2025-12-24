import { PartialType } from '@nestjs/swagger';
import { CreateTaskCatalogDto } from './create-task-catalog.dto';

export class UpdateTaskCatalogDto extends PartialType(CreateTaskCatalogDto) {}
