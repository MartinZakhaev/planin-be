import { Injectable } from '@nestjs/common';
import { CreateProjectDivisionDto } from './dto/create-project-division.dto';
import { UpdateProjectDivisionDto } from './dto/update-project-division.dto';

@Injectable()
export class ProjectDivisionsService {
  create(createProjectDivisionDto: CreateProjectDivisionDto) {
    return 'This action adds a new projectDivision';
  }

  findAll() {
    return `This action returns all projectDivisions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} projectDivision`;
  }

  update(id: number, updateProjectDivisionDto: UpdateProjectDivisionDto) {
    return `This action updates a #${id} projectDivision`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectDivision`;
  }
}
