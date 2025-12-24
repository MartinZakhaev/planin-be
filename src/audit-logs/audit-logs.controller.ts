import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuditLogEntity } from './entities/audit-log.entity';

@Controller('audit-logs')
@ApiTags('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) { }

  @Post()
  @ApiCreatedResponse({ type: AuditLogEntity })
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogsService.create(createAuditLogDto);
  }

  @Get()
  @ApiOkResponse({ type: AuditLogEntity, isArray: true })
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: AuditLogEntity })
  async findOne(@Param('id') id: string) {
    const auditLog = await this.auditLogsService.findOne(id);
    if (!auditLog) {
      throw new NotFoundException(`AuditLog with ID ${id} not found`);
    }
    return auditLog;
  }

  @Patch(':id')
  @ApiOkResponse({ type: AuditLogEntity })
  update(@Param('id') id: string, @Body() updateAuditLogDto: UpdateAuditLogDto) {
    return this.auditLogsService.update(id, updateAuditLogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: AuditLogEntity })
  remove(@Param('id') id: string) {
    return this.auditLogsService.remove(id);
  }
}
