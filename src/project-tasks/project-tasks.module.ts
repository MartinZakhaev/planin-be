import { Module } from '@nestjs/common';
import { ProjectTasksService } from './project-tasks.service';
import { ProjectTasksController } from './project-tasks.controller';

@Module({
  controllers: [ProjectTasksController],
  providers: [ProjectTasksService],
})
export class ProjectTasksModule {}
