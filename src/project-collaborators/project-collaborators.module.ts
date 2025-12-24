import { Module } from '@nestjs/common';
import { ProjectCollaboratorsService } from './project-collaborators.service';
import { ProjectCollaboratorsController } from './project-collaborators.controller';

import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjectCollaboratorsController],
  providers: [ProjectCollaboratorsService, PrismaService],
})
export class ProjectCollaboratorsModule { }
