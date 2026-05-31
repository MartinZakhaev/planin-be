import { Injectable } from '@nestjs/common';
import { CreateTaskCatalogDto } from './dto/create-task-catalog.dto';
import { CreatePersonalTaskCatalogDto } from './dto/create-personal-task-catalog.dto';
import { UpdateTaskCatalogDto } from './dto/update-task-catalog.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TaskCatalogEntity } from './entities/task-catalog.entity';

@Injectable()
export class TaskCatalogsService {
  constructor(private readonly prisma: PrismaService) { }

  private sanitizePrefix(prefix?: string) {
    const normalized = (prefix || 'TASK')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return (normalized || 'TASK').slice(0, 24);
  }

  private async generatePersonalCode(divisionId: string, prefix?: string) {
    const base = this.sanitizePrefix(prefix);
    const existingCount = await this.prisma.taskCatalog.count({
      where: {
        divisionId,
        code: { startsWith: `${base}-` },
      },
    });

    for (let index = existingCount + 1; index < existingCount + 1000; index += 1) {
      const code = `${base}-${String(index).padStart(3, '0')}`;
      const existing = await this.prisma.taskCatalog.findFirst({
        where: { divisionId, code },
        select: { id: true },
      });
      if (!existing) return code;
    }

    throw new Error(`Unable to generate task code for prefix ${base}`);
  }

  async create(createTaskCatalogDto: CreateTaskCatalogDto) {
    const catalog = await this.prisma.taskCatalog.create({
      data: createTaskCatalogDto,
    });
    return new TaskCatalogEntity(catalog);
  }

  async createPersonal(userId: string, createTaskCatalogDto: CreatePersonalTaskCatalogDto) {
    const code = await this.generatePersonalCode(createTaskCatalogDto.divisionId, createTaskCatalogDto.prefix);
    const catalog = await this.prisma.taskCatalog.create({
      data: {
        divisionId: createTaskCatalogDto.divisionId,
        ownerUserId: userId,
        code,
        name: createTaskCatalogDto.name,
        description: createTaskCatalogDto.description,
      },
    });
    return new TaskCatalogEntity(catalog);
  }

  async findAll(userId?: string) {
    const catalogs = await this.prisma.taskCatalog.findMany({
      where: userId
        ? {
          OR: [
            { ownerUserId: null },
            { ownerUserId: userId },
          ],
        }
        : undefined,
      orderBy: [
        { ownerUserId: 'asc' },
        { code: 'asc' },
      ],
    });
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
