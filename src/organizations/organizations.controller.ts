import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { OrganizationEntity } from './entities/organization.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('organizations')
@ApiTags('organizations')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) { }

  @Post()
  @ApiCreatedResponse({ type: OrganizationEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires organization create permission.' })
  @RequirePermission('organization', 'create')
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOkResponse({ type: OrganizationEntity, isArray: true })
  @RequirePermission('organization', 'read')
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: OrganizationEntity })
  @RequirePermission('organization', 'read')
  async findOne(@Param('id') id: string) {
    const organization = await this.organizationsService.findOne(id);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  @Patch(':id')
  @ApiOkResponse({ type: OrganizationEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires organization update permission.' })
  @RequirePermission('organization', 'update')
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: OrganizationEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires organization delete permission.' })
  @RequirePermission('organization', 'delete')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
