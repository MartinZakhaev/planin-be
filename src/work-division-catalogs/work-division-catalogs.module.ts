import { Module } from '@nestjs/common';
import { WorkDivisionCatalogsService } from './work-division-catalogs.service';
import { WorkDivisionCatalogsController } from './work-division-catalogs.controller';

@Module({
  controllers: [WorkDivisionCatalogsController],
  providers: [WorkDivisionCatalogsService],
})
export class WorkDivisionCatalogsModule {}
