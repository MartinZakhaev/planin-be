import { PartialType } from '@nestjs/swagger';
import { CreateItemCatalogDto } from './create-item-catalog.dto';

export class UpdateItemCatalogDto extends PartialType(CreateItemCatalogDto) {}
