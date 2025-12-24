import { Test, TestingModule } from '@nestjs/testing';
import { RabSummariesController } from './rab-summaries.controller';
import { RabSummariesService } from './rab-summaries.service';

describe('RabSummariesController', () => {
  let controller: RabSummariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RabSummariesController],
      providers: [RabSummariesService],
    }).compile();

    controller = module.get<RabSummariesController>(RabSummariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
