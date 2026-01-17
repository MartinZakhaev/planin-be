import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectEntity } from './entities/project.entity';
import { ROLES } from '../auth/permissions';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProjectDto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: createProjectDto,
    });
    return new ProjectEntity(project);
  }

  /**
   * Find all projects accessible to a user
   * - Superadmins see all projects
   * - Other users see: owned, collaborated, or org-member projects
   */
  async findAllForUser(userId: string, role: string) {
    // Superadmins see everything
    if (role === ROLES.SUPERADMIN) {
      const projects = await this.prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return projects.map((p) => new ProjectEntity(p));
    }

    // Get user's organizations (as owner or member)
    const userOrgs = await this.prisma.organization.findMany({
      where: {
        OR: [
          { ownerUserId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: { id: true },
    });
    const orgIds = userOrgs.map((o) => o.id);

    // Find projects where user is owner, collaborator, or org member
    const projects = await this.prisma.project.findMany({
      where: {
        OR: [
          { ownerUserId: userId },
          { collaborators: { some: { userId } } },
          { organizationId: { in: orgIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => new ProjectEntity(p));
  }

  async findAll() {
    const projects = await this.prisma.project.findMany();
    return projects.map((project) => new ProjectEntity(project));
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true, code: true },
        },
        owner: {
          select: { id: true, fullName: true, email: true },
        },
        divisions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            division: true,
            tasks: {
              orderBy: { sortOrder: 'asc' },
              include: {
                taskCatalog: true,
                lineItems: {
                  include: {
                    itemCatalog: true,
                    unit: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!project) return null;

    // Serialize to convert Decimal/BigInt to regular numbers
    return JSON.parse(JSON.stringify(project, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
    return new ProjectEntity(project);
  }

  async remove(id: string) {
    const project = await this.prisma.project.delete({
      where: { id },
    });
    return new ProjectEntity(project);
  }
}
