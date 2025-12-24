import { Module } from '@nestjs/common';
import { TaskLineItemsService } from './task-line-items.service';
import { TaskLineItemsController } from './task-line-items.controller';

@Module({
  controllers: [TaskLineItemsController],
  providers: [TaskLineItemsService],
})
export class TaskLineItemsModule {}
