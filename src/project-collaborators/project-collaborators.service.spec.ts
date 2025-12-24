import { Test, TestingModule } from '@nestjs/testing';
import { ProjectCollaboratorsService } from './project-collaborators.service';

describe('ProjectCollaboratorsService', () => {
  let service: ProjectCollaboratorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectCollaboratorsService],
    }).compile();

    service = module.get<ProjectCollaboratorsService>(ProjectCollaboratorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
