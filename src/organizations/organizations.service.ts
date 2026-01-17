import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationEntity } from './entities/organization.entity';
import { ROLES } from '../auth/permissions';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createOrganizationDto: CreateOrganizationDto) {
    const organization = await this.prisma.organization.create({
      data: createOrganizationDto,
    });
    return new OrganizationEntity(organization);
  }

  /**
   * Find all organizations accessible to a user
   * - Superadmins see all organizations
   * - Other users see: owned or member organizations
   */
  async findAllForUser(userId: string, role: string) {
    // Superadmins see everything
    if (role === ROLES.SUPERADMIN) {
      const orgs = await this.prisma.organization.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return orgs.map((o) => new OrganizationEntity(o));
    }

    // Find organizations where user is owner or member
    const organizations = await this.prisma.organization.findMany({
      where: {
        OR: [
          { ownerUserId: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return organizations.map((o) => new OrganizationEntity(o));
  }

  async findAll() {
    const organizations = await this.prisma.organization.findMany();
    return organizations.map((org) => new OrganizationEntity(org));
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });
    if (!organization) return null;
    return new OrganizationEntity(organization);
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });
    return new OrganizationEntity(organization);
  }

  async remove(id: string) {
    const organization = await this.prisma.organization.delete({
      where: { id },
    });
    return new OrganizationEntity(organization);
  }
}
