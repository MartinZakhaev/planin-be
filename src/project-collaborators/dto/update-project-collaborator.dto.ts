import { PartialType } from '@nestjs/swagger';
import { CreateProjectCollaboratorDto } from './create-project-collaborator.dto';

export class UpdateProjectCollaboratorDto extends PartialType(CreateProjectCollaboratorDto) {}
