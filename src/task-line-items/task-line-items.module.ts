import { Module } from '@nestjs/common';
import { TaskLineItemsService } from './task-line-items.service';
import { TaskLineItemsController } from './task-line-items.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TaskLineItemsController],
  providers: [TaskLineItemsService, PrismaService],
})
export class TaskLineItemsModule { }
