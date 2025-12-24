import { Injectable } from '@nestjs/common';
import { CreateProjectCollaboratorDto } from './dto/create-project-collaborator.dto';
import { UpdateProjectCollaboratorDto } from './dto/update-project-collaborator.dto';

@Injectable()
export class ProjectCollaboratorsService {
  create(createProjectCollaboratorDto: CreateProjectCollaboratorDto) {
    return 'This action adds a new projectCollaborator';
  }

  findAll() {
    return `This action returns all projectCollaborators`;
  }

  findOne(id: number) {
    return `This action returns a #${id} projectCollaborator`;
  }

  update(id: number, updateProjectCollaboratorDto: UpdateProjectCollaboratorDto) {
    return `This action updates a #${id} projectCollaborator`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectCollaborator`;
  }
}
