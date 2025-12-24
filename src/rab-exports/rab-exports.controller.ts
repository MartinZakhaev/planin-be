import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RabExportsService } from './rab-exports.service';
import { CreateRabExportDto } from './dto/create-rab-export.dto';
import { UpdateRabExportDto } from './dto/update-rab-export.dto';

@Controller('rab-exports')
export class RabExportsController {
  constructor(private readonly rabExportsService: RabExportsService) {}

  @Post()
  create(@Body() createRabExportDto: CreateRabExportDto) {
    return this.rabExportsService.create(createRabExportDto);
  }

  @Get()
  findAll() {
    return this.rabExportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rabExportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRabExportDto: UpdateRabExportDto) {
    return this.rabExportsService.update(+id, updateRabExportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rabExportsService.remove(+id);
  }
}
