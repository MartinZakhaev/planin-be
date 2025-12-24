import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { WorkDivisionCatalogsService } from './work-division-catalogs.service';
import { CreateWorkDivisionCatalogDto } from './dto/create-work-division-catalog.dto';
import { UpdateWorkDivisionCatalogDto } from './dto/update-work-division-catalog.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { WorkDivisionCatalogEntity } from './entities/work-division-catalog.entity';

@Controller('work-division-catalogs')
@ApiTags('work-division-catalogs')
export class WorkDivisionCatalogsController {
  constructor(private readonly workDivisionCatalogsService: WorkDivisionCatalogsService) { }

  @Post()
  @ApiCreatedResponse({ type: WorkDivisionCatalogEntity })
  create(@Body() createWorkDivisionCatalogDto: CreateWorkDivisionCatalogDto) {
    return this.workDivisionCatalogsService.create(createWorkDivisionCatalogDto);
  }

  @Get()
  @ApiOkResponse({ type: WorkDivisionCatalogEntity, isArray: true })
  findAll() {
    return this.workDivisionCatalogsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: WorkDivisionCatalogEntity })
  async findOne(@Param('id') id: string) {
    const catalog = await this.workDivisionCatalogsService.findOne(id);
    if (!catalog) {
      throw new NotFoundException(`Work Division Catalog with ID ${id} not found`);
    }
    return catalog;
  }

  @Patch(':id')
  @ApiOkResponse({ type: WorkDivisionCatalogEntity })
  update(@Param('id') id: string, @Body() updateWorkDivisionCatalogDto: UpdateWorkDivisionCatalogDto) {
    return this.workDivisionCatalogsService.update(id, updateWorkDivisionCatalogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: WorkDivisionCatalogEntity })
  remove(@Param('id') id: string) {
    return this.workDivisionCatalogsService.remove(id);
  }
}
