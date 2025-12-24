import { Injectable } from '@nestjs/common';
import { CreateProjectCollaboratorDto } from './dto/create-project-collaborator.dto';
import { UpdateProjectCollaboratorDto } from './dto/update-project-collaborator.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectCollaboratorEntity } from './entities/project-collaborator.entity';

@Injectable()
export class ProjectCollaboratorsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProjectCollaboratorDto: CreateProjectCollaboratorDto) {
    const collaborator = await this.prisma.projectCollaborator.create({
      data: createProjectCollaboratorDto,
    });
    return new ProjectCollaboratorEntity(collaborator);
  }

  async findAll() {
    const collaborators = await this.prisma.projectCollaborator.findMany();
    return collaborators.map((collaborator) => new ProjectCollaboratorEntity(collaborator));
  }

  async findOne(id: string) {
    const collaborator = await this.prisma.projectCollaborator.findUnique({
      where: { id },
    });
    if (!collaborator) return null;
    return new ProjectCollaboratorEntity(collaborator);
  }

  async update(id: string, updateProjectCollaboratorDto: UpdateProjectCollaboratorDto) {
    const collaborator = await this.prisma.projectCollaborator.update({
      where: { id },
      data: updateProjectCollaboratorDto,
    });
    return new ProjectCollaboratorEntity(collaborator);
  }

  async remove(id: string) {
    const collaborator = await this.prisma.projectCollaborator.delete({
      where: { id },
    });
    return new ProjectCollaboratorEntity(collaborator);
  }
}
