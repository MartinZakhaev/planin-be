import { Injectable } from '@nestjs/common';
import { CreateTaskCatalogDto } from './dto/create-task-catalog.dto';
import { UpdateTaskCatalogDto } from './dto/update-task-catalog.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TaskCatalogEntity } from './entities/task-catalog.entity';

@Injectable()
export class TaskCatalogsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTaskCatalogDto: CreateTaskCatalogDto) {
    const catalog = await this.prisma.taskCatalog.create({
      data: createTaskCatalogDto,
    });
    return new TaskCatalogEntity(catalog);
  }

  async findAll() {
    const catalogs = await this.prisma.taskCatalog.findMany();
    return catalogs.map((catalog) => new TaskCatalogEntity(catalog));
  }

  async findOne(id: string) {
    const catalog = await this.prisma.taskCatalog.findUnique({
      where: { id },
    });
    if (!catalog) return null;
    return new TaskCatalogEntity(catalog);
  }

  async update(id: string, updateTaskCatalogDto: UpdateTaskCatalogDto) {
    const catalog = await this.prisma.taskCatalog.update({
      where: { id },
      data: updateTaskCatalogDto,
    });
    return new TaskCatalogEntity(catalog);
  }

  async remove(id: string) {
    const catalog = await this.prisma.taskCatalog.delete({
      where: { id },
    });
    return new TaskCatalogEntity(catalog);
  }
}
