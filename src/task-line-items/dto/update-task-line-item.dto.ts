import { PartialType } from '@nestjs/swagger';
import { CreateTaskLineItemDto } from './create-task-line-item.dto';

export class UpdateTaskLineItemDto extends PartialType(CreateTaskLineItemDto) {}
