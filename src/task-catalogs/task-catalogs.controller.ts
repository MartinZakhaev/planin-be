import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaskCatalogsService } from './task-catalogs.service';
import { CreateTaskCatalogDto } from './dto/create-task-catalog.dto';
import { UpdateTaskCatalogDto } from './dto/update-task-catalog.dto';

@Controller('task-catalogs')
export class TaskCatalogsController {
  constructor(private readonly taskCatalogsService: TaskCatalogsService) {}

  @Post()
  create(@Body() createTaskCatalogDto: CreateTaskCatalogDto) {
    return this.taskCatalogsService.create(createTaskCatalogDto);
  }

  @Get()
  findAll() {
    return this.taskCatalogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskCatalogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskCatalogDto: UpdateTaskCatalogDto) {
    return this.taskCatalogsService.update(+id, updateTaskCatalogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskCatalogsService.remove(+id);
  }
}
