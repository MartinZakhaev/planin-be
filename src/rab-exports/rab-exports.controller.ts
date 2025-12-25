import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { RabExportsService } from './rab-exports.service';
import { CreateRabExportDto } from './dto/create-rab-export.dto';
import { UpdateRabExportDto } from './dto/update-rab-export.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { RabExportEntity } from './entities/rab-export.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('rab-exports')
@ApiTags('rab-exports')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class RabExportsController {
  constructor(private readonly rabExportsService: RabExportsService) { }

  @Post()
  @ApiCreatedResponse({ type: RabExportEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  create(@Body() createRabExportDto: CreateRabExportDto) {
    return this.rabExportsService.create(createRabExportDto);
  }

  @Get()
  @ApiOkResponse({ type: RabExportEntity, isArray: true })
  @RequirePermission('project', 'read')
  findAll() {
    return this.rabExportsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: RabExportEntity })
  @RequirePermission('project', 'read')
  async findOne(@Param('id') id: string) {
    const rabExport = await this.rabExportsService.findOne(id);
    if (!rabExport) {
      throw new NotFoundException(`RabExport with ID ${id} not found`);
    }
    return rabExport;
  }

  @Patch(':id')
  @ApiOkResponse({ type: RabExportEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  update(@Param('id') id: string, @Body() updateRabExportDto: UpdateRabExportDto) {
    return this.rabExportsService.update(id, updateRabExportDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: RabExportEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  remove(@Param('id') id: string) {
    return this.rabExportsService.remove(id);
  }
}
