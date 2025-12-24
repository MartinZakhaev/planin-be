import { Injectable } from '@nestjs/common';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectTaskEntity } from './entities/project-task.entity';

@Injectable()
export class ProjectTasksService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProjectTaskDto: CreateProjectTaskDto) {
    // Note: rowVersion is handled by database default or logic, here passing DTO.
    // If Prisma generates BigInt for rowVersion, we might need handling if we returned it directly, but Entity handles assignment usually.
    const task = await this.prisma.projectTask.create({
      data: createProjectTaskDto,
    });
    return new ProjectTaskEntity(task);
  }

  async findAll() {
    const tasks = await this.prisma.projectTask.findMany();
    return tasks.map((task) => new ProjectTaskEntity(task));
  }

  async findOne(id: string) {
    const task = await this.prisma.projectTask.findUnique({
      where: { id },
    });
    if (!task) return null;
    return new ProjectTaskEntity(task);
  }

  async update(id: string, updateProjectTaskDto: UpdateProjectTaskDto) {
    const task = await this.prisma.projectTask.update({
      where: { id },
      data: updateProjectTaskDto,
    });
    return new ProjectTaskEntity(task);
  }

  async remove(id: string) {
    const task = await this.prisma.projectTask.delete({
      where: { id },
    });
    return new ProjectTaskEntity(task);
  }
}
