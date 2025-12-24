import { Injectable } from '@nestjs/common';
import { CreateTaskLineItemDto } from './dto/create-task-line-item.dto';
import { UpdateTaskLineItemDto } from './dto/update-task-line-item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TaskLineItemEntity } from './entities/task-line-item.entity';

@Injectable()
export class TaskLineItemsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTaskLineItemDto: CreateTaskLineItemDto) {
    // Calculate lineTotal from quantity * unitPrice
    const lineTotal = createTaskLineItemDto.quantity * createTaskLineItemDto.unitPrice;

    const item = await this.prisma.taskLineItem.create({
      data: {
        projectId: createTaskLineItemDto.projectId,
        projectTaskId: createTaskLineItemDto.projectTaskId,
        itemCatalogId: createTaskLineItemDto.itemCatalogId,
        unitId: createTaskLineItemDto.unitId,
        description: createTaskLineItemDto.description,
        quantity: createTaskLineItemDto.quantity,
        unitPrice: createTaskLineItemDto.unitPrice,
        lineTotal: lineTotal,
        taxable: createTaskLineItemDto.taxable,
      },
    });
    return new TaskLineItemEntity(item);
  }

  async findAll() {
    const items = await this.prisma.taskLineItem.findMany();
    return items.map((item) => new TaskLineItemEntity(item));
  }

  async findOne(id: string) {
    const item = await this.prisma.taskLineItem.findUnique({
      where: { id },
    });
    if (!item) return null;
    return new TaskLineItemEntity(item);
  }

  async update(id: string, updateTaskLineItemDto: UpdateTaskLineItemDto) {
    // If quantity or unitPrice is updated, recalculate lineTotal
    let lineTotal: number | undefined;
    if (updateTaskLineItemDto.quantity !== undefined || updateTaskLineItemDto.unitPrice !== undefined) {
      const existing = await this.prisma.taskLineItem.findUnique({ where: { id } });
      if (existing) {
        const qty = updateTaskLineItemDto.quantity ?? Number(existing.quantity);
        const price = updateTaskLineItemDto.unitPrice ?? Number(existing.unitPrice);
        lineTotal = qty * price;
      }
    }

    const data: any = { ...updateTaskLineItemDto };
    if (lineTotal !== undefined) {
      data.lineTotal = lineTotal;
    }

    const item = await this.prisma.taskLineItem.update({
      where: { id },
      data,
    });
    return new TaskLineItemEntity(item);
  }

  async remove(id: string) {
    const item = await this.prisma.taskLineItem.delete({
      where: { id },
    });
    return new TaskLineItemEntity(item);
  }
}
