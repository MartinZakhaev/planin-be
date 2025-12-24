import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectCollaboratorsService } from './project-collaborators.service';
import { CreateProjectCollaboratorDto } from './dto/create-project-collaborator.dto';
import { UpdateProjectCollaboratorDto } from './dto/update-project-collaborator.dto';

@Controller('project-collaborators')
export class ProjectCollaboratorsController {
  constructor(private readonly projectCollaboratorsService: ProjectCollaboratorsService) {}

  @Post()
  create(@Body() createProjectCollaboratorDto: CreateProjectCollaboratorDto) {
    return this.projectCollaboratorsService.create(createProjectCollaboratorDto);
  }

  @Get()
  findAll() {
    return this.projectCollaboratorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectCollaboratorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectCollaboratorDto: UpdateProjectCollaboratorDto) {
    return this.projectCollaboratorsService.update(+id, updateProjectCollaboratorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectCollaboratorsService.remove(+id);
  }
}
