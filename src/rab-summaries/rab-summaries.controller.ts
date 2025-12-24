import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RabSummariesService } from './rab-summaries.service';
import { CreateRabSummaryDto } from './dto/create-rab-summary.dto';
import { UpdateRabSummaryDto } from './dto/update-rab-summary.dto';

@Controller('rab-summaries')
export class RabSummariesController {
  constructor(private readonly rabSummariesService: RabSummariesService) {}

  @Post()
  create(@Body() createRabSummaryDto: CreateRabSummaryDto) {
    return this.rabSummariesService.create(createRabSummaryDto);
  }

  @Get()
  findAll() {
    return this.rabSummariesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rabSummariesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRabSummaryDto: UpdateRabSummaryDto) {
    return this.rabSummariesService.update(+id, updateRabSummaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rabSummariesService.remove(+id);
  }
}
