import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { ProjectDivisionsService } from './project-divisions.service';
import { CreateProjectDivisionDto } from './dto/create-project-division.dto';
import { UpdateProjectDivisionDto } from './dto/update-project-division.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { ProjectDivisionEntity } from './entities/project-division.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('project-divisions')
@ApiTags('project-divisions')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class ProjectDivisionsController {
  constructor(private readonly projectDivisionsService: ProjectDivisionsService) { }

  @Post()
  @ApiCreatedResponse({ type: ProjectDivisionEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  create(@Body() createProjectDivisionDto: CreateProjectDivisionDto) {
    return this.projectDivisionsService.create(createProjectDivisionDto);
  }

  @Get()
  @ApiOkResponse({ type: ProjectDivisionEntity, isArray: true })
  @RequirePermission('project', 'read')
  findAll() {
    return this.projectDivisionsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProjectDivisionEntity })
  @RequirePermission('project', 'read')
  async findOne(@Param('id') id: string) {
    const division = await this.projectDivisionsService.findOne(id);
    if (!division) {
      throw new NotFoundException(`Project Division with ID ${id} not found`);
    }
    return division;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProjectDivisionEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  update(@Param('id') id: string, @Body() updateProjectDivisionDto: UpdateProjectDivisionDto) {
    return this.projectDivisionsService.update(id, updateProjectDivisionDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ProjectDivisionEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  remove(@Param('id') id: string) {
    return this.projectDivisionsService.remove(id);
  }
}
