import { Test, TestingModule } from '@nestjs/testing';
import { TaskCatalogsController } from './task-catalogs.controller';
import { TaskCatalogsService } from './task-catalogs.service';

describe('TaskCatalogsController', () => {
  let controller: TaskCatalogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskCatalogsController],
      providers: [TaskCatalogsService],
    }).compile();

    controller = module.get<TaskCatalogsController>(TaskCatalogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
