import { Injectable } from '@nestjs/common';
import { CreateRabExportDto } from './dto/create-rab-export.dto';
import { UpdateRabExportDto } from './dto/update-rab-export.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RabExportEntity } from './entities/rab-export.entity';

@Injectable()
export class RabExportsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createRabExportDto: CreateRabExportDto) {
    const rabExport = await this.prisma.rabExport.create({
      data: createRabExportDto,
    });
    return new RabExportEntity(rabExport);
  }

  async findAll() {
    const rabExports = await this.prisma.rabExport.findMany();
    return rabExports.map((rabExport) => new RabExportEntity(rabExport));
  }

  async findOne(id: string) {
    const rabExport = await this.prisma.rabExport.findUnique({
      where: { id },
    });
    if (!rabExport) return null;
    return new RabExportEntity(rabExport);
  }

  async update(id: string, updateRabExportDto: UpdateRabExportDto) {
    const rabExport = await this.prisma.rabExport.update({
      where: { id },
      data: updateRabExportDto,
    });
    return new RabExportEntity(rabExport);
  }

  async remove(id: string) {
    const rabExport = await this.prisma.rabExport.delete({
      where: { id },
    });
    return new RabExportEntity(rabExport);
  }
}
