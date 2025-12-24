import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { OrganizationMembersService } from './organization-members.service';
import { CreateOrganizationMemberDto } from './dto/create-organization-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-organization-member.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationMemberEntity } from './entities/organization-member.entity';

@Controller('organization-members')
@ApiTags('organization-members')
export class OrganizationMembersController {
  constructor(private readonly organizationMembersService: OrganizationMembersService) { }

  @Post()
  @ApiCreatedResponse({ type: OrganizationMemberEntity })
  create(@Body() createOrganizationMemberDto: CreateOrganizationMemberDto) {
    return this.organizationMembersService.create(createOrganizationMemberDto);
  }

  @Get()
  @ApiOkResponse({ type: OrganizationMemberEntity, isArray: true })
  findAll() {
    return this.organizationMembersService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: OrganizationMemberEntity })
  async findOne(@Param('id') id: string) {
    const member = await this.organizationMembersService.findOne(id);
    if (!member) {
      throw new NotFoundException(`Organization Member with ID ${id} not found`);
    }
    return member;
  }

  @Patch(':id')
  @ApiOkResponse({ type: OrganizationMemberEntity })
  update(@Param('id') id: string, @Body() updateOrganizationMemberDto: UpdateOrganizationMemberDto) {
    return this.organizationMembersService.update(id, updateOrganizationMemberDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: OrganizationMemberEntity })
  remove(@Param('id') id: string) {
    return this.organizationMembersService.remove(id);
  }
}
