import { Injectable } from '@nestjs/common';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';

@Injectable()
export class ProjectTasksService {
  create(createProjectTaskDto: CreateProjectTaskDto) {
    return 'This action adds a new projectTask';
  }

  findAll() {
    return `This action returns all projectTasks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} projectTask`;
  }

  update(id: number, updateProjectTaskDto: UpdateProjectTaskDto) {
    return `This action updates a #${id} projectTask`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectTask`;
  }
}
