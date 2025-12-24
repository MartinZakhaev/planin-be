import { Module } from '@nestjs/common';
import { ItemCatalogsService } from './item-catalogs.service';
import { ItemCatalogsController } from './item-catalogs.controller';

import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ItemCatalogsController],
  providers: [ItemCatalogsService, PrismaService],
})
export class ItemCatalogsModule { }
