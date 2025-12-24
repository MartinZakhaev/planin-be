import { Test, TestingModule } from '@nestjs/testing';
import { ItemCatalogsService } from './item-catalogs.service';

describe('ItemCatalogsService', () => {
  let service: ItemCatalogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemCatalogsService],
    }).compile();

    service = module.get<ItemCatalogsService>(ItemCatalogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
