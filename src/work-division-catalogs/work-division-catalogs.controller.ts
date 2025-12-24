import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkDivisionCatalogsService } from './work-division-catalogs.service';
import { CreateWorkDivisionCatalogDto } from './dto/create-work-division-catalog.dto';
import { UpdateWorkDivisionCatalogDto } from './dto/update-work-division-catalog.dto';

@Controller('work-division-catalogs')
export class WorkDivisionCatalogsController {
  constructor(private readonly workDivisionCatalogsService: WorkDivisionCatalogsService) {}

  @Post()
  create(@Body() createWorkDivisionCatalogDto: CreateWorkDivisionCatalogDto) {
    return this.workDivisionCatalogsService.create(createWorkDivisionCatalogDto);
  }

  @Get()
  findAll() {
    return this.workDivisionCatalogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workDivisionCatalogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkDivisionCatalogDto: UpdateWorkDivisionCatalogDto) {
    return this.workDivisionCatalogsService.update(+id, updateWorkDivisionCatalogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workDivisionCatalogsService.remove(+id);
  }
}
