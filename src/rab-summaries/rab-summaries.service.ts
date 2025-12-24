import { Injectable } from '@nestjs/common';
import { CreateRabSummaryDto } from './dto/create-rab-summary.dto';
import { UpdateRabSummaryDto } from './dto/update-rab-summary.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RabSummaryEntity } from './entities/rab-summary.entity';

@Injectable()
export class RabSummariesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createRabSummaryDto: CreateRabSummaryDto) {
    const summary = await this.prisma.rabSummary.create({
      data: {
        projectId: createRabSummaryDto.projectId,
        createdBy: createRabSummaryDto.createdBy,
        version: createRabSummaryDto.version,
        subtotalMaterial: createRabSummaryDto.subtotalMaterial,
        subtotalManpower: createRabSummaryDto.subtotalManpower,
        subtotalTools: createRabSummaryDto.subtotalTools,
        taxableSubtotal: createRabSummaryDto.taxableSubtotal,
        nontaxSubtotal: createRabSummaryDto.nontaxSubtotal,
        taxRatePercent: createRabSummaryDto.taxRatePercent,
        taxAmount: createRabSummaryDto.taxAmount,
        grandTotal: createRabSummaryDto.grandTotal,
        notes: createRabSummaryDto.notes,
      },
    });
    return new RabSummaryEntity(summary);
  }

  async findAll() {
    const summaries = await this.prisma.rabSummary.findMany();
    return summaries.map((summary) => new RabSummaryEntity(summary));
  }

  async findOne(id: string) {
    const summary = await this.prisma.rabSummary.findUnique({
      where: { id },
    });
    if (!summary) return null;
    return new RabSummaryEntity(summary);
  }

  async update(id: string, updateRabSummaryDto: UpdateRabSummaryDto) {
    const summary = await this.prisma.rabSummary.update({
      where: { id },
      data: updateRabSummaryDto,
    });
    return new RabSummaryEntity(summary);
  }

  async remove(id: string) {
    const summary = await this.prisma.rabSummary.delete({
      where: { id },
    });
    return new RabSummaryEntity(summary);
  }
}
