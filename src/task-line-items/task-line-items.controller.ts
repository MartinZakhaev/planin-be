import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { TaskLineItemsService } from './task-line-items.service';
import { CreateTaskLineItemDto } from './dto/create-task-line-item.dto';
import { UpdateTaskLineItemDto } from './dto/update-task-line-item.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { TaskLineItemEntity } from './entities/task-line-item.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('task-line-items')
@ApiTags('task-line-items')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class TaskLineItemsController {
  constructor(private readonly taskLineItemsService: TaskLineItemsService) { }

  @Post()
  @ApiCreatedResponse({ type: TaskLineItemEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  create(@Body() createTaskLineItemDto: CreateTaskLineItemDto) {
    return this.taskLineItemsService.create(createTaskLineItemDto);
  }

  @Get()
  @ApiOkResponse({ type: TaskLineItemEntity, isArray: true })
  @RequirePermission('project', 'read')
  findAll() {
    return this.taskLineItemsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskLineItemEntity })
  @RequirePermission('project', 'read')
  async findOne(@Param('id') id: string) {
    const item = await this.taskLineItemsService.findOne(id);
    if (!item) {
      throw new NotFoundException(`TaskLineItem with ID ${id} not found`);
    }
    return item;
  }

  @Patch(':id')
  @ApiOkResponse({ type: TaskLineItemEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  update(@Param('id') id: string, @Body() updateTaskLineItemDto: UpdateTaskLineItemDto) {
    return this.taskLineItemsService.update(id, updateTaskLineItemDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TaskLineItemEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  remove(@Param('id') id: string) {
    return this.taskLineItemsService.remove(id);
  }
}
