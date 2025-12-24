import { Test, TestingModule } from '@nestjs/testing';
import { WorkDivisionCatalogsController } from './work-division-catalogs.controller';
import { WorkDivisionCatalogsService } from './work-division-catalogs.service';

describe('WorkDivisionCatalogsController', () => {
  let controller: WorkDivisionCatalogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkDivisionCatalogsController],
      providers: [WorkDivisionCatalogsService],
    }).compile();

    controller = module.get<WorkDivisionCatalogsController>(WorkDivisionCatalogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
