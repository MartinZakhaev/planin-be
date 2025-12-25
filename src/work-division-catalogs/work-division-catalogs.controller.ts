import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { WorkDivisionCatalogsService } from './work-division-catalogs.service';
import { CreateWorkDivisionCatalogDto } from './dto/create-work-division-catalog.dto';
import { UpdateWorkDivisionCatalogDto } from './dto/update-work-division-catalog.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { WorkDivisionCatalogEntity } from './entities/work-division-catalog.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('work-division-catalogs')
@ApiTags('work-division-catalogs')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class WorkDivisionCatalogsController {
  constructor(private readonly workDivisionCatalogsService: WorkDivisionCatalogsService) { }

  @Post()
  @ApiCreatedResponse({ type: WorkDivisionCatalogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('work_division', 'create')
  create(@Body() createWorkDivisionCatalogDto: CreateWorkDivisionCatalogDto) {
    return this.workDivisionCatalogsService.create(createWorkDivisionCatalogDto);
  }

  @Get()
  @ApiOkResponse({ type: WorkDivisionCatalogEntity, isArray: true })
  @RequirePermission('work_division', 'read')
  findAll() {
    return this.workDivisionCatalogsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: WorkDivisionCatalogEntity })
  @RequirePermission('work_division', 'read')
  async findOne(@Param('id') id: string) {
    const catalog = await this.workDivisionCatalogsService.findOne(id);
    if (!catalog) {
      throw new NotFoundException(`Work Division Catalog with ID ${id} not found`);
    }
    return catalog;
  }

  @Patch(':id')
  @ApiOkResponse({ type: WorkDivisionCatalogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('work_division', 'update')
  update(@Param('id') id: string, @Body() updateWorkDivisionCatalogDto: UpdateWorkDivisionCatalogDto) {
    return this.workDivisionCatalogsService.update(id, updateWorkDivisionCatalogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: WorkDivisionCatalogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('work_division', 'delete')
  remove(@Param('id') id: string) {
    return this.workDivisionCatalogsService.remove(id);
  }
}
