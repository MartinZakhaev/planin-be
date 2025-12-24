import { PartialType } from '@nestjs/swagger';
import { CreateProjectDivisionDto } from './create-project-division.dto';

export class UpdateProjectDivisionDto extends PartialType(CreateProjectDivisionDto) {}
