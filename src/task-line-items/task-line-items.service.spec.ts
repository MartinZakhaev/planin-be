import { Test, TestingModule } from '@nestjs/testing';
import { TaskLineItemsService } from './task-line-items.service';

describe('TaskLineItemsService', () => {
  let service: TaskLineItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskLineItemsService],
    }).compile();

    service = module.get<TaskLineItemsService>(TaskLineItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
