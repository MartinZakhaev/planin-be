import { Injectable } from '@nestjs/common';
import { CreateWorkDivisionCatalogDto } from './dto/create-work-division-catalog.dto';
import { UpdateWorkDivisionCatalogDto } from './dto/update-work-division-catalog.dto';
import { PrismaService } from '../prisma/prisma.service';
import { WorkDivisionCatalogEntity } from './entities/work-division-catalog.entity';

@Injectable()
export class WorkDivisionCatalogsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createWorkDivisionCatalogDto: CreateWorkDivisionCatalogDto) {
    const catalog = await this.prisma.workDivisionCatalog.create({
      data: createWorkDivisionCatalogDto,
    });
    return new WorkDivisionCatalogEntity(catalog);
  }

  async findAll() {
    const catalogs = await this.prisma.workDivisionCatalog.findMany();
    return catalogs.map((catalog) => new WorkDivisionCatalogEntity(catalog));
  }

  async findOne(id: string) {
    const catalog = await this.prisma.workDivisionCatalog.findUnique({
      where: { id },
    });
    if (!catalog) return null;
    return new WorkDivisionCatalogEntity(catalog);
  }

  async update(id: string, updateWorkDivisionCatalogDto: UpdateWorkDivisionCatalogDto) {
    const catalog = await this.prisma.workDivisionCatalog.update({
      where: { id },
      data: updateWorkDivisionCatalogDto,
    });
    return new WorkDivisionCatalogEntity(catalog);
  }

  async remove(id: string) {
    const catalog = await this.prisma.workDivisionCatalog.delete({
      where: { id },
    });
    return new WorkDivisionCatalogEntity(catalog);
  }
}
