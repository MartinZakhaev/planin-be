import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { ItemCatalogsService } from './item-catalogs.service';
import { CreateItemCatalogDto } from './dto/create-item-catalog.dto';
import { UpdateItemCatalogDto } from './dto/update-item-catalog.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { ItemCatalogEntity } from './entities/item-catalog.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('item-catalogs')
@ApiTags('item-catalogs')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class ItemCatalogsController {
  constructor(private readonly itemCatalogsService: ItemCatalogsService) { }

  @Post()
  @ApiCreatedResponse({ type: ItemCatalogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('item_catalog', 'create')
  create(@Body() createItemCatalogDto: CreateItemCatalogDto) {
    return this.itemCatalogsService.create(createItemCatalogDto);
  }

  @Get()
  @ApiOkResponse({ type: ItemCatalogEntity, isArray: true })
  @RequirePermission('item_catalog', 'read')
  findAll() {
    return this.itemCatalogsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ItemCatalogEntity })
  @RequirePermission('item_catalog', 'read')
  async findOne(@Param('id') id: string) {
    const catalog = await this.itemCatalogsService.findOne(id);
    if (!catalog) {
      throw new NotFoundException(`Item Catalog with ID ${id} not found`);
    }
    return catalog;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ItemCatalogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('item_catalog', 'update')
  update(@Param('id') id: string, @Body() updateItemCatalogDto: UpdateItemCatalogDto) {
    return this.itemCatalogsService.update(id, updateItemCatalogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ItemCatalogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('item_catalog', 'delete')
  remove(@Param('id') id: string) {
    return this.itemCatalogsService.remove(id);
  }
}
