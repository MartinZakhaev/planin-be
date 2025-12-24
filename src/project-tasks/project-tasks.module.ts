import { Module } from '@nestjs/common';
import { ProjectTasksService } from './project-tasks.service';
import { ProjectTasksController } from './project-tasks.controller';

import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjectTasksController],
  providers: [ProjectTasksService, PrismaService],
})
export class ProjectTasksModule { }
