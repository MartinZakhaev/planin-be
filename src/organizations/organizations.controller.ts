import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationEntity } from './entities/organization.entity';

@Controller('organizations')
@ApiTags('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) { }

  @Post()
  @ApiCreatedResponse({ type: OrganizationEntity })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOkResponse({ type: OrganizationEntity, isArray: true })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: OrganizationEntity })
  async findOne(@Param('id') id: string) {
    const organization = await this.organizationsService.findOne(id);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  @Patch(':id')
  @ApiOkResponse({ type: OrganizationEntity })
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: OrganizationEntity })
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
