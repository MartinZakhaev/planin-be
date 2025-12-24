import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectTasksService } from './project-tasks.service';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';

@Controller('project-tasks')
export class ProjectTasksController {
  constructor(private readonly projectTasksService: ProjectTasksService) {}

  @Post()
  create(@Body() createProjectTaskDto: CreateProjectTaskDto) {
    return this.projectTasksService.create(createProjectTaskDto);
  }

  @Get()
  findAll() {
    return this.projectTasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectTasksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectTaskDto: UpdateProjectTaskDto) {
    return this.projectTasksService.update(+id, updateProjectTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectTasksService.remove(+id);
  }
}
