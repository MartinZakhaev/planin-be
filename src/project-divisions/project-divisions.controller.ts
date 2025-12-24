import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ProjectDivisionsService } from './project-divisions.service';
import { CreateProjectDivisionDto } from './dto/create-project-division.dto';
import { UpdateProjectDivisionDto } from './dto/update-project-division.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProjectDivisionEntity } from './entities/project-division.entity';

@Controller('project-divisions')
@ApiTags('project-divisions')
export class ProjectDivisionsController {
  constructor(private readonly projectDivisionsService: ProjectDivisionsService) { }

  @Post()
  @ApiCreatedResponse({ type: ProjectDivisionEntity })
  create(@Body() createProjectDivisionDto: CreateProjectDivisionDto) {
    return this.projectDivisionsService.create(createProjectDivisionDto);
  }

  @Get()
  @ApiOkResponse({ type: ProjectDivisionEntity, isArray: true })
  findAll() {
    return this.projectDivisionsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProjectDivisionEntity })
  async findOne(@Param('id') id: string) {
    const division = await this.projectDivisionsService.findOne(id);
    if (!division) {
      throw new NotFoundException(`Project Division with ID ${id} not found`);
    }
    return division;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProjectDivisionEntity })
  update(@Param('id') id: string, @Body() updateProjectDivisionDto: UpdateProjectDivisionDto) {
    return this.projectDivisionsService.update(id, updateProjectDivisionDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ProjectDivisionEntity })
  remove(@Param('id') id: string) {
    return this.projectDivisionsService.remove(id);
  }
}
