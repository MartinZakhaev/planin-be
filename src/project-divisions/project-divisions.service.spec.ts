import { Test, TestingModule } from '@nestjs/testing';
import { ProjectDivisionsService } from './project-divisions.service';

describe('ProjectDivisionsService', () => {
  let service: ProjectDivisionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectDivisionsService],
    }).compile();

    service = module.get<ProjectDivisionsService>(ProjectDivisionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
