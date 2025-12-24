import { Module } from '@nestjs/common';
import { TaskCatalogsService } from './task-catalogs.service';
import { TaskCatalogsController } from './task-catalogs.controller';

import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TaskCatalogsController],
  providers: [TaskCatalogsService, PrismaService],
})
export class TaskCatalogsModule { }
