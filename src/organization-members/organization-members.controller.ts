import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { OrganizationMembersService } from './organization-members.service';
import { CreateOrganizationMemberDto } from './dto/create-organization-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-organization-member.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { OrganizationMemberEntity } from './entities/organization-member.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('organization-members')
@ApiTags('organization-members')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationMembersController {
  constructor(private readonly organizationMembersService: OrganizationMembersService) { }

  @Post()
  @ApiCreatedResponse({ type: OrganizationMemberEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires organization manage-members permission.' })
  @RequirePermission('organization', 'manage-members')
  create(@Body() createOrganizationMemberDto: CreateOrganizationMemberDto) {
    return this.organizationMembersService.create(createOrganizationMemberDto);
  }

  @Get()
  @ApiOkResponse({ type: OrganizationMemberEntity, isArray: true })
  @RequirePermission('organization', 'read')
  findAll() {
    return this.organizationMembersService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: OrganizationMemberEntity })
  @RequirePermission('organization', 'read')
  async findOne(@Param('id') id: string) {
    const member = await this.organizationMembersService.findOne(id);
    if (!member) {
      throw new NotFoundException(`Organization Member with ID ${id} not found`);
    }
    return member;
  }

  @Patch(':id')
  @ApiOkResponse({ type: OrganizationMemberEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires organization manage-members permission.' })
  @RequirePermission('organization', 'manage-members')
  update(@Param('id') id: string, @Body() updateOrganizationMemberDto: UpdateOrganizationMemberDto) {
    return this.organizationMembersService.update(id, updateOrganizationMemberDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: OrganizationMemberEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires organization manage-members permission.' })
  @RequirePermission('organization', 'manage-members')
  remove(@Param('id') id: string) {
    return this.organizationMembersService.remove(id);
  }
}
