import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { RabExportsService } from './rab-exports.service';
import { CreateRabExportDto } from './dto/create-rab-export.dto';
import { UpdateRabExportDto } from './dto/update-rab-export.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RabExportEntity } from './entities/rab-export.entity';

@Controller('rab-exports')
@ApiTags('rab-exports')
export class RabExportsController {
  constructor(private readonly rabExportsService: RabExportsService) { }

  @Post()
  @ApiCreatedResponse({ type: RabExportEntity })
  create(@Body() createRabExportDto: CreateRabExportDto) {
    return this.rabExportsService.create(createRabExportDto);
  }

  @Get()
  @ApiOkResponse({ type: RabExportEntity, isArray: true })
  findAll() {
    return this.rabExportsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: RabExportEntity })
  async findOne(@Param('id') id: string) {
    const rabExport = await this.rabExportsService.findOne(id);
    if (!rabExport) {
      throw new NotFoundException(`RabExport with ID ${id} not found`);
    }
    return rabExport;
  }

  @Patch(':id')
  @ApiOkResponse({ type: RabExportEntity })
  update(@Param('id') id: string, @Body() updateRabExportDto: UpdateRabExportDto) {
    return this.rabExportsService.update(id, updateRabExportDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: RabExportEntity })
  remove(@Param('id') id: string) {
    return this.rabExportsService.remove(id);
  }
}
