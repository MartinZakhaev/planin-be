import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { RabSummariesService } from './rab-summaries.service';
import { CreateRabSummaryDto } from './dto/create-rab-summary.dto';
import { UpdateRabSummaryDto } from './dto/update-rab-summary.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RabSummaryEntity } from './entities/rab-summary.entity';

@Controller('rab-summaries')
@ApiTags('rab-summaries')
export class RabSummariesController {
  constructor(private readonly rabSummariesService: RabSummariesService) { }

  @Post()
  @ApiCreatedResponse({ type: RabSummaryEntity })
  create(@Body() createRabSummaryDto: CreateRabSummaryDto) {
    return this.rabSummariesService.create(createRabSummaryDto);
  }

  @Get()
  @ApiOkResponse({ type: RabSummaryEntity, isArray: true })
  findAll() {
    return this.rabSummariesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: RabSummaryEntity })
  async findOne(@Param('id') id: string) {
    const summary = await this.rabSummariesService.findOne(id);
    if (!summary) {
      throw new NotFoundException(`RabSummary with ID ${id} not found`);
    }
    return summary;
  }

  @Patch(':id')
  @ApiOkResponse({ type: RabSummaryEntity })
  update(@Param('id') id: string, @Body() updateRabSummaryDto: UpdateRabSummaryDto) {
    return this.rabSummariesService.update(id, updateRabSummaryDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: RabSummaryEntity })
  remove(@Param('id') id: string) {
    return this.rabSummariesService.remove(id);
  }
}
