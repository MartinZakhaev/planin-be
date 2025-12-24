import { Injectable } from '@nestjs/common';
import { CreateProjectDivisionDto } from './dto/create-project-division.dto';
import { UpdateProjectDivisionDto } from './dto/update-project-division.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectDivisionEntity } from './entities/project-division.entity';

@Injectable()
export class ProjectDivisionsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProjectDivisionDto: CreateProjectDivisionDto) {
    const division = await this.prisma.projectDivision.create({
      data: createProjectDivisionDto,
    });
    return new ProjectDivisionEntity(division);
  }

  async findAll() {
    const divisions = await this.prisma.projectDivision.findMany();
    return divisions.map((division) => new ProjectDivisionEntity(division));
  }

  async findOne(id: string) {
    const division = await this.prisma.projectDivision.findUnique({
      where: { id },
    });
    if (!division) return null;
    return new ProjectDivisionEntity(division);
  }

  async update(id: string, updateProjectDivisionDto: UpdateProjectDivisionDto) {
    const division = await this.prisma.projectDivision.update({
      where: { id },
      data: updateProjectDivisionDto,
    });
    return new ProjectDivisionEntity(division);
  }

  async remove(id: string) {
    const division = await this.prisma.projectDivision.delete({
      where: { id },
    });
    return new ProjectDivisionEntity(division);
  }
}
