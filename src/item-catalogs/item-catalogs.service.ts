import { Injectable } from '@nestjs/common';
import { CreateItemCatalogDto } from './dto/create-item-catalog.dto';
import { UpdateItemCatalogDto } from './dto/update-item-catalog.dto';

@Injectable()
export class ItemCatalogsService {
  create(createItemCatalogDto: CreateItemCatalogDto) {
    return 'This action adds a new itemCatalog';
  }

  findAll() {
    return `This action returns all itemCatalogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} itemCatalog`;
  }

  update(id: number, updateItemCatalogDto: UpdateItemCatalogDto) {
    return `This action updates a #${id} itemCatalog`;
  }

  remove(id: number) {
    return `This action removes a #${id} itemCatalog`;
  }
}
