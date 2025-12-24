import { Test, TestingModule } from '@nestjs/testing';
import { ItemCatalogsController } from './item-catalogs.controller';
import { ItemCatalogsService } from './item-catalogs.service';

describe('ItemCatalogsController', () => {
  let controller: ItemCatalogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemCatalogsController],
      providers: [ItemCatalogsService],
    }).compile();

    controller = module.get<ItemCatalogsController>(ItemCatalogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
