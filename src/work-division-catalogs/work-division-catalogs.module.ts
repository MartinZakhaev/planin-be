import { Module } from '@nestjs/common';
import { WorkDivisionCatalogsService } from './work-division-catalogs.service';
import { WorkDivisionCatalogsController } from './work-division-catalogs.controller';

import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WorkDivisionCatalogsController],
  providers: [WorkDivisionCatalogsService, PrismaService],
})
export class WorkDivisionCatalogsModule { }
