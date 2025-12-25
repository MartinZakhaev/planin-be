import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('audit-logs')
@ApiTags('audit-logs')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) { }

  @Post()
  @ApiCreatedResponse({ type: AuditLogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Superadmin only.' })
  @RequirePermission('audit_log', 'create')
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogsService.create(createAuditLogDto);
  }

  @Get()
  @ApiOkResponse({ type: AuditLogEntity, isArray: true })
  @RequirePermission('audit_log', 'read')
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: AuditLogEntity })
  @RequirePermission('audit_log', 'read')
  async findOne(@Param('id') id: string) {
    const auditLog = await this.auditLogsService.findOne(id);
    if (!auditLog) {
      throw new NotFoundException(`AuditLog with ID ${id} not found`);
    }
    return auditLog;
  }

  @Patch(':id')
  @ApiOkResponse({ type: AuditLogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Superadmin only.' })
  @RequirePermission('audit_log', 'update')
  update(@Param('id') id: string, @Body() updateAuditLogDto: UpdateAuditLogDto) {
    return this.auditLogsService.update(id, updateAuditLogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: AuditLogEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Superadmin only.' })
  @RequirePermission('audit_log', 'delete')
  remove(@Param('id') id: string) {
    return this.auditLogsService.remove(id);
  }
}
