import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { RabSummariesService } from './rab-summaries.service';
import { CreateRabSummaryDto } from './dto/create-rab-summary.dto';
import { UpdateRabSummaryDto } from './dto/update-rab-summary.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { RabSummaryEntity } from './entities/rab-summary.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('rab-summaries')
@ApiTags('rab-summaries')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class RabSummariesController {
  constructor(private readonly rabSummariesService: RabSummariesService) { }

  @Post()
  @ApiCreatedResponse({ type: RabSummaryEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  create(@Body() createRabSummaryDto: CreateRabSummaryDto) {
    return this.rabSummariesService.create(createRabSummaryDto);
  }

  @Get()
  @ApiOkResponse({ type: RabSummaryEntity, isArray: true })
  @RequirePermission('project', 'read')
  findAll() {
    return this.rabSummariesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: RabSummaryEntity })
  @RequirePermission('project', 'read')
  async findOne(@Param('id') id: string) {
    const summary = await this.rabSummariesService.findOne(id);
    if (!summary) {
      throw new NotFoundException(`RabSummary with ID ${id} not found`);
    }
    return summary;
  }

  @Patch(':id')
  @ApiOkResponse({ type: RabSummaryEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  update(@Param('id') id: string, @Body() updateRabSummaryDto: UpdateRabSummaryDto) {
    return this.rabSummariesService.update(id, updateRabSummaryDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: RabSummaryEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  remove(@Param('id') id: string) {
    return this.rabSummariesService.remove(id);
  }
}
