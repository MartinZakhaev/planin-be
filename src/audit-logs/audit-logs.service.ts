import { Injectable } from '@nestjs/common';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createAuditLogDto: CreateAuditLogDto) {
    const auditLog = await this.prisma.auditLog.create({
      data: createAuditLogDto,
    });
    return new AuditLogEntity(auditLog);
  }

  async findAll() {
    const auditLogs = await this.prisma.auditLog.findMany();
    return auditLogs.map((auditLog) => new AuditLogEntity(auditLog));
  }

  async findOne(id: string) {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
    });
    if (!auditLog) return null;
    return new AuditLogEntity(auditLog);
  }

  async update(id: string, updateAuditLogDto: UpdateAuditLogDto) {
    const auditLog = await this.prisma.auditLog.update({
      where: { id },
      data: updateAuditLogDto,
    });
    return new AuditLogEntity(auditLog);
  }

  async remove(id: string) {
    const auditLog = await this.prisma.auditLog.delete({
      where: { id },
    });
    return new AuditLogEntity(auditLog);
  }
}
