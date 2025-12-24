import { Test, TestingModule } from '@nestjs/testing';
import { WorkDivisionCatalogsService } from './work-division-catalogs.service';

describe('WorkDivisionCatalogsService', () => {
  let service: WorkDivisionCatalogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkDivisionCatalogsService],
    }).compile();

    service = module.get<WorkDivisionCatalogsService>(WorkDivisionCatalogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
