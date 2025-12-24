import { Module } from '@nestjs/common';
import { ItemCatalogsService } from './item-catalogs.service';
import { ItemCatalogsController } from './item-catalogs.controller';

@Module({
  controllers: [ItemCatalogsController],
  providers: [ItemCatalogsService],
})
export class ItemCatalogsModule {}
