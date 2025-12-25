import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@ApiTags('Units')
@ApiCookieAuth('better-auth.session_token')
@Controller('units')
@UseGuards(AuthGuard, PermissionsGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiBody({ type: CreateUnitDto })
  @ApiResponse({ status: 201, description: 'The unit has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @RequirePermission('unit', 'create')
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all units' })
  @ApiResponse({ status: 200, description: 'List of all units.' })
  @RequirePermission('unit', 'read')
  findAll() {
    return this.unitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single unit by ID' })
  @ApiParam({ name: 'id', description: 'The UUID of the unit' })
  @ApiResponse({ status: 200, description: 'The found unit.' })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  @RequirePermission('unit', 'read')
  async findOne(@Param('id') id: string) {
    const unit = await this.unitsService.findOne(id);
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return unit;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit' })
  @ApiParam({ name: 'id', description: 'The UUID of the unit' })
  @ApiBody({ type: UpdateUnitDto })
  @ApiResponse({ status: 200, description: 'The unit has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @RequirePermission('unit', 'update')
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiParam({ name: 'id', description: 'The UUID of the unit' })
  @ApiResponse({ status: 200, description: 'The unit has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Unit not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @RequirePermission('unit', 'delete')
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}
