import { Test, TestingModule } from '@nestjs/testing';
import { ProjectCollaboratorsController } from './project-collaborators.controller';
import { ProjectCollaboratorsService } from './project-collaborators.service';

describe('ProjectCollaboratorsController', () => {
  let controller: ProjectCollaboratorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectCollaboratorsController],
      providers: [ProjectCollaboratorsService],
    }).compile();

    controller = module.get<ProjectCollaboratorsController>(ProjectCollaboratorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
