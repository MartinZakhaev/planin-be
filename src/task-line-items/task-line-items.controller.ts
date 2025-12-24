import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { TaskLineItemsService } from './task-line-items.service';
import { CreateTaskLineItemDto } from './dto/create-task-line-item.dto';
import { UpdateTaskLineItemDto } from './dto/update-task-line-item.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TaskLineItemEntity } from './entities/task-line-item.entity';

@Controller('task-line-items')
@ApiTags('task-line-items')
export class TaskLineItemsController {
  constructor(private readonly taskLineItemsService: TaskLineItemsService) { }

  @Post()
  @ApiCreatedResponse({ type: TaskLineItemEntity })
  create(@Body() createTaskLineItemDto: CreateTaskLineItemDto) {
    return this.taskLineItemsService.create(createTaskLineItemDto);
  }

  @Get()
  @ApiOkResponse({ type: TaskLineItemEntity, isArray: true })
  findAll() {
    return this.taskLineItemsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskLineItemEntity })
  async findOne(@Param('id') id: string) {
    const item = await this.taskLineItemsService.findOne(id);
    if (!item) {
      throw new NotFoundException(`TaskLineItem with ID ${id} not found`);
    }
    return item;
  }

  @Patch(':id')
  @ApiOkResponse({ type: TaskLineItemEntity })
  update(@Param('id') id: string, @Body() updateTaskLineItemDto: UpdateTaskLineItemDto) {
    return this.taskLineItemsService.update(id, updateTaskLineItemDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TaskLineItemEntity })
  remove(@Param('id') id: string) {
    return this.taskLineItemsService.remove(id);
  }
}
