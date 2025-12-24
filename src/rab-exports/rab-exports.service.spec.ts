import { Test, TestingModule } from '@nestjs/testing';
import { RabExportsService } from './rab-exports.service';

describe('RabExportsService', () => {
  let service: RabExportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RabExportsService],
    }).compile();

    service = module.get<RabExportsService>(RabExportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
