import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizationMembersService } from './organization-members.service';
import { CreateOrganizationMemberDto } from './dto/create-organization-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-organization-member.dto';

@Controller('organization-members')
export class OrganizationMembersController {
  constructor(private readonly organizationMembersService: OrganizationMembersService) {}

  @Post()
  create(@Body() createOrganizationMemberDto: CreateOrganizationMemberDto) {
    return this.organizationMembersService.create(createOrganizationMemberDto);
  }

  @Get()
  findAll() {
    return this.organizationMembersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationMembersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizationMemberDto: UpdateOrganizationMemberDto) {
    return this.organizationMembersService.update(+id, updateOrganizationMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationMembersService.remove(+id);
  }
}
