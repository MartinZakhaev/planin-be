import { Test, TestingModule } from '@nestjs/testing';
import { TaskLineItemsController } from './task-line-items.controller';
import { TaskLineItemsService } from './task-line-items.service';

describe('TaskLineItemsController', () => {
  let controller: TaskLineItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskLineItemsController],
      providers: [TaskLineItemsService],
    }).compile();

    controller = module.get<TaskLineItemsController>(TaskLineItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
