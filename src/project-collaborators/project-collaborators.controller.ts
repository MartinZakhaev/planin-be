import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ProjectCollaboratorsService } from './project-collaborators.service';
import { CreateProjectCollaboratorDto } from './dto/create-project-collaborator.dto';
import { UpdateProjectCollaboratorDto } from './dto/update-project-collaborator.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProjectCollaboratorEntity } from './entities/project-collaborator.entity';

@Controller('project-collaborators')
@ApiTags('project-collaborators')
export class ProjectCollaboratorsController {
  constructor(private readonly projectCollaboratorsService: ProjectCollaboratorsService) { }

  @Post()
  @ApiCreatedResponse({ type: ProjectCollaboratorEntity })
  create(@Body() createProjectCollaboratorDto: CreateProjectCollaboratorDto) {
    return this.projectCollaboratorsService.create(createProjectCollaboratorDto);
  }

  @Get()
  @ApiOkResponse({ type: ProjectCollaboratorEntity, isArray: true })
  findAll() {
    return this.projectCollaboratorsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProjectCollaboratorEntity })
  async findOne(@Param('id') id: string) {
    const collaborator = await this.projectCollaboratorsService.findOne(id);
    if (!collaborator) {
      throw new NotFoundException(`Project Collaborator with ID ${id} not found`);
    }
    return collaborator;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProjectCollaboratorEntity })
  update(@Param('id') id: string, @Body() updateProjectCollaboratorDto: UpdateProjectCollaboratorDto) {
    return this.projectCollaboratorsService.update(id, updateProjectCollaboratorDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ProjectCollaboratorEntity })
  remove(@Param('id') id: string) {
    return this.projectCollaboratorsService.remove(id);
  }
}
