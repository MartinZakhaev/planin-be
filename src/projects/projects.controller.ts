import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { ProjectEntity } from './entities/project.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('projects')
@ApiTags('projects')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @ApiCreatedResponse({ type: ProjectEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('project', 'create')
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOkResponse({ type: ProjectEntity, isArray: true })
  @RequirePermission('project', 'read')
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProjectEntity })
  @RequirePermission('project', 'read')
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProjectEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('project', 'update')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ProjectEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission('project', 'delete')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
