import { Test, TestingModule } from '@nestjs/testing';
import { RabSummariesService } from './rab-summaries.service';

describe('RabSummariesService', () => {
  let service: RabSummariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RabSummariesService],
    }).compile();

    service = module.get<RabSummariesService>(RabSummariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
