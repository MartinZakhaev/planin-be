import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { TaskCatalogsService } from './task-catalogs.service';
import { CreateTaskCatalogDto } from './dto/create-task-catalog.dto';
import { UpdateTaskCatalogDto } from './dto/update-task-catalog.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { TaskCatalogEntity } from './entities/task-catalog.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('task-catalogs')
@ApiTags('task-catalogs')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class TaskCatalogsController {
  constructor(private readonly taskCatalogsService: TaskCatalogsService) { }

  @Post()
  @ApiCreatedResponse({ type: TaskCatalogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('task_catalog', 'create')
  create(@Body() createTaskCatalogDto: CreateTaskCatalogDto) {
    return this.taskCatalogsService.create(createTaskCatalogDto);
  }

  @Get()
  @ApiOkResponse({ type: TaskCatalogEntity, isArray: true })
  @RequirePermission('task_catalog', 'read')
  findAll() {
    return this.taskCatalogsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskCatalogEntity })
  @RequirePermission('task_catalog', 'read')
  async findOne(@Param('id') id: string) {
    const catalog = await this.taskCatalogsService.findOne(id);
    if (!catalog) {
      throw new NotFoundException(`Task Catalog with ID ${id} not found`);
    }
    return catalog;
  }

  @Patch(':id')
  @ApiOkResponse({ type: TaskCatalogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('task_catalog', 'update')
  update(@Param('id') id: string, @Body() updateTaskCatalogDto: UpdateTaskCatalogDto) {
    return this.taskCatalogsService.update(id, updateTaskCatalogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TaskCatalogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('task_catalog', 'delete')
  remove(@Param('id') id: string) {
    return this.taskCatalogsService.remove(id);
  }
}
