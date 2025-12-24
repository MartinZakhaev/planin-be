import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ItemCatalogsService } from './item-catalogs.service';
import { CreateItemCatalogDto } from './dto/create-item-catalog.dto';
import { UpdateItemCatalogDto } from './dto/update-item-catalog.dto';

@Controller('item-catalogs')
export class ItemCatalogsController {
  constructor(private readonly itemCatalogsService: ItemCatalogsService) {}

  @Post()
  create(@Body() createItemCatalogDto: CreateItemCatalogDto) {
    return this.itemCatalogsService.create(createItemCatalogDto);
  }

  @Get()
  findAll() {
    return this.itemCatalogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemCatalogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemCatalogDto: UpdateItemCatalogDto) {
    return this.itemCatalogsService.update(+id, updateItemCatalogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemCatalogsService.remove(+id);
  }
}
