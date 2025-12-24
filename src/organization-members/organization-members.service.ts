import { Injectable } from '@nestjs/common';
import { CreateOrganizationMemberDto } from './dto/create-organization-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-organization-member.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationMemberEntity } from './entities/organization-member.entity';

@Injectable()
export class OrganizationMembersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createOrganizationMemberDto: CreateOrganizationMemberDto) {
    const member = await this.prisma.organizationMember.create({
      data: createOrganizationMemberDto,
    });
    return new OrganizationMemberEntity(member);
  }

  async findAll() {
    const members = await this.prisma.organizationMember.findMany();
    return members.map((member) => new OrganizationMemberEntity(member));
  }

  async findOne(id: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { id },
    });
    if (!member) return null;
    return new OrganizationMemberEntity(member);
  }

  async update(id: string, updateOrganizationMemberDto: UpdateOrganizationMemberDto) {
    const member = await this.prisma.organizationMember.update({
      where: { id },
      data: updateOrganizationMemberDto,
    });
    return new OrganizationMemberEntity(member);
  }

  async remove(id: string) {
    const member = await this.prisma.organizationMember.delete({
      where: { id },
    });
    return new OrganizationMemberEntity(member);
  }
}
