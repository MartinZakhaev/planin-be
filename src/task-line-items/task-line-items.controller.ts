import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaskLineItemsService } from './task-line-items.service';
import { CreateTaskLineItemDto } from './dto/create-task-line-item.dto';
import { UpdateTaskLineItemDto } from './dto/update-task-line-item.dto';

@Controller('task-line-items')
export class TaskLineItemsController {
  constructor(private readonly taskLineItemsService: TaskLineItemsService) {}

  @Post()
  create(@Body() createTaskLineItemDto: CreateTaskLineItemDto) {
    return this.taskLineItemsService.create(createTaskLineItemDto);
  }

  @Get()
  findAll() {
    return this.taskLineItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskLineItemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskLineItemDto: UpdateTaskLineItemDto) {
    return this.taskLineItemsService.update(+id, updateTaskLineItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskLineItemsService.remove(+id);
  }
}
