import { Test, TestingModule } from '@nestjs/testing';
import { ProjectDivisionsController } from './project-divisions.controller';
import { ProjectDivisionsService } from './project-divisions.service';

describe('ProjectDivisionsController', () => {
  let controller: ProjectDivisionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectDivisionsController],
      providers: [ProjectDivisionsService],
    }).compile();

    controller = module.get<ProjectDivisionsController>(ProjectDivisionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
