import { Injectable } from '@nestjs/common';
import { CreateTaskCatalogDto } from './dto/create-task-catalog.dto';
import { UpdateTaskCatalogDto } from './dto/update-task-catalog.dto';

@Injectable()
export class TaskCatalogsService {
  create(createTaskCatalogDto: CreateTaskCatalogDto) {
    return 'This action adds a new taskCatalog';
  }

  findAll() {
    return `This action returns all taskCatalogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} taskCatalog`;
  }

  update(id: number, updateTaskCatalogDto: UpdateTaskCatalogDto) {
    return `This action updates a #${id} taskCatalog`;
  }

  remove(id: number) {
    return `This action removes a #${id} taskCatalog`;
  }
}
