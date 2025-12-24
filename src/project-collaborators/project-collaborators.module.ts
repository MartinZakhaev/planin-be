import { Module } from '@nestjs/common';
import { ProjectCollaboratorsService } from './project-collaborators.service';
import { ProjectCollaboratorsController } from './project-collaborators.controller';

@Module({
  controllers: [ProjectCollaboratorsController],
  providers: [ProjectCollaboratorsService],
})
export class ProjectCollaboratorsModule {}
