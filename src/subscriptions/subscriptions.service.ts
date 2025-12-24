import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionEntity } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const subscription = await this.prisma.subscription.create({
      data: createSubscriptionDto,
    });
    return new SubscriptionEntity(subscription);
  }

  async findAll() {
    const subscriptions = await this.prisma.subscription.findMany();
    return subscriptions.map((sub) => new SubscriptionEntity(sub));
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });
    if (!subscription) return null;
    return new SubscriptionEntity(subscription);
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
    });
    return new SubscriptionEntity(subscription);
  }

  async remove(id: string) {
    const subscription = await this.prisma.subscription.delete({
      where: { id },
    });
    return new SubscriptionEntity(subscription);
  }
}
