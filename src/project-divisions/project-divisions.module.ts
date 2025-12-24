import { Module } from '@nestjs/common';
import { ProjectDivisionsService } from './project-divisions.service';
import { ProjectDivisionsController } from './project-divisions.controller';

import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjectDivisionsController],
  providers: [ProjectDivisionsService, PrismaService],
})
export class ProjectDivisionsModule { }
