import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { ProjectTasksService } from './project-tasks.service';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { ProjectTaskEntity } from './entities/project-task.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('project-tasks')
@ApiTags('project-tasks')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class ProjectTasksController {
  constructor(private readonly projectTasksService: ProjectTasksService) { }

  @Post()
  @ApiCreatedResponse({ type: ProjectTaskEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  create(@Body() createProjectTaskDto: CreateProjectTaskDto) {
    return this.projectTasksService.create(createProjectTaskDto);
  }

  @Get()
  @ApiOkResponse({ type: ProjectTaskEntity, isArray: true })
  @RequirePermission('project', 'read')
  findAll() {
    return this.projectTasksService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProjectTaskEntity })
  @RequirePermission('project', 'read')
  async findOne(@Param('id') id: string) {
    const task = await this.projectTasksService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Project Task with ID ${id} not found`);
    }
    return task;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProjectTaskEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  update(@Param('id') id: string, @Body() updateProjectTaskDto: UpdateProjectTaskDto) {
    return this.projectTasksService.update(id, updateProjectTaskDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ProjectTaskEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  remove(@Param('id') id: string) {
    return this.projectTasksService.remove(id);
  }
}
