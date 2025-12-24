import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ProjectTasksService } from './project-tasks.service';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProjectTaskEntity } from './entities/project-task.entity';

@Controller('project-tasks')
@ApiTags('project-tasks')
export class ProjectTasksController {
  constructor(private readonly projectTasksService: ProjectTasksService) { }

  @Post()
  @ApiCreatedResponse({ type: ProjectTaskEntity })
  create(@Body() createProjectTaskDto: CreateProjectTaskDto) {
    return this.projectTasksService.create(createProjectTaskDto);
  }

  @Get()
  @ApiOkResponse({ type: ProjectTaskEntity, isArray: true })
  findAll() {
    return this.projectTasksService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProjectTaskEntity })
  async findOne(@Param('id') id: string) {
    const task = await this.projectTasksService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Project Task with ID ${id} not found`);
    }
    return task;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProjectTaskEntity })
  update(@Param('id') id: string, @Body() updateProjectTaskDto: UpdateProjectTaskDto) {
    return this.projectTasksService.update(id, updateProjectTaskDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ProjectTaskEntity })
  remove(@Param('id') id: string) {
    return this.projectTasksService.remove(id);
  }
}
