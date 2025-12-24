import { Test, TestingModule } from '@nestjs/testing';
import { RabExportsController } from './rab-exports.controller';
import { RabExportsService } from './rab-exports.service';

describe('RabExportsController', () => {
  let controller: RabExportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RabExportsController],
      providers: [RabExportsService],
    }).compile();

    controller = module.get<RabExportsController>(RabExportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
