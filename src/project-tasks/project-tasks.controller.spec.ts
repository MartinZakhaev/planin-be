import { Test, TestingModule } from '@nestjs/testing';
import { ProjectTasksController } from './project-tasks.controller';
import { ProjectTasksService } from './project-tasks.service';

describe('ProjectTasksController', () => {
  let controller: ProjectTasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectTasksController],
      providers: [ProjectTasksService],
    }).compile();

    controller = module.get<ProjectTasksController>(ProjectTasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
