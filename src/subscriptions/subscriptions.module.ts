import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { WebhookController } from './webhook.controller';
import { MidtransService } from './midtrans.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SubscriptionsController, WebhookController],
  providers: [SubscriptionsService, MidtransService, PrismaService],
})
export class SubscriptionsModule { }
