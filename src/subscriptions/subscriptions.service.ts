import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionEntity } from './entities/subscription.entity';
import { MidtransService } from './midtrans.service';
import { DokuService } from './doku.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly midtrans: MidtransService,
    private readonly doku: DokuService,
  ) { }

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

  async findByUser(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
    return sub;
  }

  async findAllPlans() {
    return this.prisma.plan.findMany({ orderBy: { priceCents: 'asc' } });
  }

  async createCheckout(userId: string, planId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (plan.priceCents === 0) throw new BadRequestException('Cannot checkout a free plan');

    const grossAmount = Math.round(plan.priceCents / 100);

    const existingSub = await this.prisma.subscription.findFirst({ where: { userId } });
    // order_id max 50 chars; use short prefix + timestamp + random suffix
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const snap = await this.midtrans.createSnapToken({
      orderId,
      grossAmount,
      customerDetails: {
        firstName: user.fullName || user.email,
        email: user.email,
      },
      itemDetails: {
        id: plan.id,
        price: grossAmount,
        quantity: 1,
        name: plan.name,
      },
    });

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: { midtransOrderId: orderId, planId, status: 'TRIALING' },
      });
    } else {
      await this.prisma.subscription.create({
        data: { userId, planId, status: 'TRIALING', midtransOrderId: orderId },
      });
    }

    return { snapToken: snap.token, redirectUrl: snap.redirect_url };
  }

  async handleWebhook(notification: any) {
    const { order_id, transaction_status, fraud_status, gross_amount, status_code, signature_key } = notification;

    if (signature_key) {
      const isValid = this.midtrans.verifySignature(order_id, status_code, gross_amount, signature_key);
      if (!isValid) throw new ForbiddenException('Invalid Midtrans signature');
    }

    const sub = await this.prisma.subscription.findFirst({ where: { midtransOrderId: order_id } });
    if (!sub) return { received: true };

    const isSuccess =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');
    const isFailed = ['cancel', 'deny', 'expire'].includes(transaction_status);

    if (isSuccess) {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    } else if (isFailed) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'CANCELED' },
      });
    }

    return { received: true };
  }

  async createDokuCheckout(userId: string, planId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (plan.priceCents === 0) throw new BadRequestException('Cannot checkout a free plan');

    const amount = Math.round(plan.priceCents / 100);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const invoiceNumber = `INV_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const existingSub = await this.prisma.subscription.findFirst({ where: { userId } });

    const dokuResponse = await this.doku.createCheckout({
      order: {
        amount,
        invoice_number: invoiceNumber,
        callback_url: `${frontendUrl}/dashboard/billing/success`,
      },
      payment: {
        payment_due_date: 60,
        payment_method_types: ['VIRTUAL_ACCOUNT_BNI'],
      },
      customer: {
        name: user.fullName || user.email,
        email: user.email,
      },
    });

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: { midtransOrderId: invoiceNumber, planId, status: 'TRIALING' },
      });
    } else {
      await this.prisma.subscription.create({
        data: { userId, planId, status: 'TRIALING', midtransOrderId: invoiceNumber },
      });
    }

    return {
      paymentUrl: dokuResponse.url,
      tokenId: dokuResponse.token_id,
      expiredDate: dokuResponse.expired_date,
      expiredDatetime: dokuResponse.expired_datetime,
    };
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
