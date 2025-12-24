import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PlanEntity } from './entities/plan.entity';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createPlanDto: CreatePlanDto) {
    const plan = await this.prisma.plan.create({
      data: createPlanDto,
    });
    return new PlanEntity(plan);
  }

  async findAll() {
    const plans = await this.prisma.plan.findMany();
    return plans.map((plan) => new PlanEntity(plan));
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });
    if (!plan) return null;
    return new PlanEntity(plan);
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    const plan = await this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    });
    return new PlanEntity(plan);
  }

  async remove(id: string) {
    const plan = await this.prisma.plan.delete({
      where: { id },
    });
    return new PlanEntity(plan);
  }
}
