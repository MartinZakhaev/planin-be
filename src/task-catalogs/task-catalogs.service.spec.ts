import { Test, TestingModule } from '@nestjs/testing';
import { TaskCatalogsService } from './task-catalogs.service';

describe('TaskCatalogsService', () => {
  let service: TaskCatalogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskCatalogsService],
    }).compile();

    service = module.get<TaskCatalogsService>(TaskCatalogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
