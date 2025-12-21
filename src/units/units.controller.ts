import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiBody({ type: CreateUnitDto })
  @ApiResponse({ status: 201, description: 'The unit has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all units' })
  @ApiResponse({ status: 200, description: 'List of all units.' })
  findAll() {
    return this.unitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single unit by ID' })
  @ApiParam({ name: 'id', description: 'The UUID of the unit' })
  @ApiResponse({ status: 200, description: 'The found unit.' })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit' })
  @ApiParam({ name: 'id', description: 'The UUID of the unit' })
  @ApiBody({ type: UpdateUnitDto })
  @ApiResponse({ status: 200, description: 'The unit has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiParam({ name: 'id', description: 'The UUID of the unit' })
  @ApiResponse({ status: 200, description: 'The unit has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}
