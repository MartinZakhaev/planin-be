import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { TaskCatalogsService } from './task-catalogs.service';
import { CreateTaskCatalogDto } from './dto/create-task-catalog.dto';
import { UpdateTaskCatalogDto } from './dto/update-task-catalog.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TaskCatalogEntity } from './entities/task-catalog.entity';

@Controller('task-catalogs')
@ApiTags('task-catalogs')
export class TaskCatalogsController {
  constructor(private readonly taskCatalogsService: TaskCatalogsService) { }

  @Post()
  @ApiCreatedResponse({ type: TaskCatalogEntity })
  create(@Body() createTaskCatalogDto: CreateTaskCatalogDto) {
    return this.taskCatalogsService.create(createTaskCatalogDto);
  }

  @Get()
  @ApiOkResponse({ type: TaskCatalogEntity, isArray: true })
  findAll() {
    return this.taskCatalogsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskCatalogEntity })
  async findOne(@Param('id') id: string) {
    const catalog = await this.taskCatalogsService.findOne(id);
    if (!catalog) {
      throw new NotFoundException(`Task Catalog with ID ${id} not found`);
    }
    return catalog;
  }

  @Patch(':id')
  @ApiOkResponse({ type: TaskCatalogEntity })
  update(@Param('id') id: string, @Body() updateTaskCatalogDto: UpdateTaskCatalogDto) {
    return this.taskCatalogsService.update(id, updateTaskCatalogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TaskCatalogEntity })
  remove(@Param('id') id: string) {
    return this.taskCatalogsService.remove(id);
  }
}
