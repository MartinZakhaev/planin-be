import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { ProjectCollaboratorsService } from './project-collaborators.service';
import { CreateProjectCollaboratorDto } from './dto/create-project-collaborator.dto';
import { UpdateProjectCollaboratorDto } from './dto/update-project-collaborator.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { ProjectCollaboratorEntity } from './entities/project-collaborator.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('project-collaborators')
@ApiTags('project-collaborators')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class ProjectCollaboratorsController {
  constructor(private readonly projectCollaboratorsService: ProjectCollaboratorsService) { }

  @Post()
  @ApiCreatedResponse({ type: ProjectCollaboratorEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project share permission.' })
  @RequirePermission('project', 'share')
  create(@Body() createProjectCollaboratorDto: CreateProjectCollaboratorDto) {
    return this.projectCollaboratorsService.create(createProjectCollaboratorDto);
  }

  @Get()
  @ApiOkResponse({ type: ProjectCollaboratorEntity, isArray: true })
  @RequirePermission('project', 'read')
  findAll() {
    return this.projectCollaboratorsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProjectCollaboratorEntity })
  @RequirePermission('project', 'read')
  async findOne(@Param('id') id: string) {
    const collaborator = await this.projectCollaboratorsService.findOne(id);
    if (!collaborator) {
      throw new NotFoundException(`Project Collaborator with ID ${id} not found`);
    }
    return collaborator;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProjectCollaboratorEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project share permission.' })
  @RequirePermission('project', 'share')
  update(@Param('id') id: string, @Body() updateProjectCollaboratorDto: UpdateProjectCollaboratorDto) {
    return this.projectCollaboratorsService.update(id, updateProjectCollaboratorDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ProjectCollaboratorEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project share permission.' })
  @RequirePermission('project', 'share')
  remove(@Param('id') id: string) {
    return this.projectCollaboratorsService.remove(id);
  }
}
