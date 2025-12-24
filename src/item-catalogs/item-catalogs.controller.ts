import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ItemCatalogsService } from './item-catalogs.service';
import { CreateItemCatalogDto } from './dto/create-item-catalog.dto';
import { UpdateItemCatalogDto } from './dto/update-item-catalog.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ItemCatalogEntity } from './entities/item-catalog.entity';

@Controller('item-catalogs')
@ApiTags('item-catalogs')
export class ItemCatalogsController {
  constructor(private readonly itemCatalogsService: ItemCatalogsService) { }

  @Post()
  @ApiCreatedResponse({ type: ItemCatalogEntity })
  create(@Body() createItemCatalogDto: CreateItemCatalogDto) {
    return this.itemCatalogsService.create(createItemCatalogDto);
  }

  @Get()
  @ApiOkResponse({ type: ItemCatalogEntity, isArray: true })
  findAll() {
    return this.itemCatalogsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ItemCatalogEntity })
  async findOne(@Param('id') id: string) {
    const catalog = await this.itemCatalogsService.findOne(id);
    if (!catalog) {
      throw new NotFoundException(`Item Catalog with ID ${id} not found`);
    }
    return catalog;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ItemCatalogEntity })
  update(@Param('id') id: string, @Body() updateItemCatalogDto: UpdateItemCatalogDto) {
    return this.itemCatalogsService.update(id, updateItemCatalogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ItemCatalogEntity })
  remove(@Param('id') id: string) {
    return this.itemCatalogsService.remove(id);
  }
}
