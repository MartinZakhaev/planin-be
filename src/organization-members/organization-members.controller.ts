import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { OrganizationMembersService } from './organization-members.service';
import { CreateOrganizationMemberDto } from './dto/create-organization-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-organization-member.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrganizationMemberEntity } from './entities/organization-member.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('organization-members')
@ApiTags('organization-members')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationMembersController {
  constructor(
    private readonly organizationMembersService: OrganizationMembersService,
    private readonly prisma: PrismaService,
  ) { }

  private async assertOrgAccess(orgId: string, userId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    if (org.ownerUserId === userId) return;
    const adminMembership = await this.prisma.organizationMember.findFirst({
      where: { organizationId: orgId, userId, role: 'ADMIN' },
    });
    if (!adminMembership) {
      throw new ForbiddenException('Not authorized to manage members of this organization');
    }
  }

  @Post()
  @ApiCreatedResponse({ type: OrganizationMemberEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires organization manage-members permission.' })
  @RequirePermission('organization', 'manage-members')
  async create(@Body() createOrganizationMemberDto: CreateOrganizationMemberDto, @Req() req: any) {
    await this.assertOrgAccess(createOrganizationMemberDto.organizationId, req.user.id);
    return this.organizationMembersService.create(createOrganizationMemberDto);
  }

  @Get()
  @ApiOkResponse({ type: OrganizationMemberEntity, isArray: true })
  @ApiQuery({ name: 'orgId', required: false, description: 'Filter members by organization ID' })
  @RequirePermission('organization', 'read')
  findAll(@Query('orgId') orgId?: string) {
    if (orgId) {
      return this.organizationMembersService.findByOrgId(orgId);
    }
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
  async update(@Param('id') id: string, @Body() updateOrganizationMemberDto: UpdateOrganizationMemberDto, @Req() req: any) {
    const member = await this.organizationMembersService.findOne(id);
    if (!member) throw new NotFoundException('Member not found');
    await this.assertOrgAccess(member.organizationId, req.user.id);
    return this.organizationMembersService.update(id, updateOrganizationMemberDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: OrganizationMemberEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires organization manage-members permission.' })
  @RequirePermission('organization', 'manage-members')
  async remove(@Param('id') id: string, @Req() req: any) {
    const member = await this.organizationMembersService.findOne(id);
    if (!member) throw new NotFoundException('Member not found');
    await this.assertOrgAccess(member.organizationId, req.user.id);
    return this.organizationMembersService.remove(id);
  }
}
