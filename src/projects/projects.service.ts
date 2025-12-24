import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectEntity } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProjectDto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: createProjectDto,
    });
    return new ProjectEntity(project);
  }

  async findAll() {
    const projects = await this.prisma.project.findMany();
    return projects.map((project) => new ProjectEntity(project));
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) return null;
    return new ProjectEntity(project);
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
