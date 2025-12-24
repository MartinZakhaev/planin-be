import { Module } from '@nestjs/common';
import { TaskCatalogsService } from './task-catalogs.service';
import { TaskCatalogsController } from './task-catalogs.controller';

@Module({
  controllers: [TaskCatalogsController],
  providers: [TaskCatalogsService],
})
export class TaskCatalogsModule {}
