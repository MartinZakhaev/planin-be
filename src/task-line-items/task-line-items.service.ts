import { Injectable } from '@nestjs/common';
import { CreateTaskLineItemDto } from './dto/create-task-line-item.dto';
import { UpdateTaskLineItemDto } from './dto/update-task-line-item.dto';

@Injectable()
export class TaskLineItemsService {
  create(createTaskLineItemDto: CreateTaskLineItemDto) {
    return 'This action adds a new taskLineItem';
  }

  findAll() {
    return `This action returns all taskLineItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} taskLineItem`;
  }

  update(id: number, updateTaskLineItemDto: UpdateTaskLineItemDto) {
    return `This action updates a #${id} taskLineItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} taskLineItem`;
  }
}
