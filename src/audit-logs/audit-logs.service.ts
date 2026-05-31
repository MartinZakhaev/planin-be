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
    const auditLogs = await this.prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return auditLogs.map((auditLog) => new AuditLogEntity(auditLog));
  }

  async findOne(id: string) {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
    if (!auditLog) return null;
    return new AuditLogEntity(auditLog);
  }

  async findPersonalCatalogSummary() {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { personalTaskCatalogs: { some: {} } },
          { personalItemCatalogs: { some: {} } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        personalTaskCatalogs: {
          include: {
            division: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        personalItemCatalogs: {
          include: {
            unit: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { email: 'asc' },
    });

    const userIds = users.map((user) => user.id);
    const recentAuditLogs = userIds.length > 0
      ? await this.prisma.auditLog.findMany({
        where: {
          userId: { in: userIds },
          entityTable: {
            in: ['task-catalogs', 'item-catalogs', 'work-division-catalogs'],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 25,
      })
      : [];

    const summaryUsers = users.map((user) => {
      const taskCatalogs = user.personalTaskCatalogs.map((task) => ({
        id: task.id,
        code: task.code,
        name: task.name,
        description: task.description,
        divisionId: task.divisionId,
        division: task.division,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));

      const itemCatalogs = user.personalItemCatalogs.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        description: item.description,
        type: item.type,
        unitId: item.unitId,
        unit: item.unit,
        defaultPrice: Number(item.defaultPrice),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
        counts: {
          taskCatalogs: taskCatalogs.length,
          itemCatalogs: itemCatalogs.length,
          workDivisions: 0,
          total: taskCatalogs.length + itemCatalogs.length,
        },
        taskCatalogs,
        itemCatalogs,
        workDivisions: [],
      };
    });

    const totals = summaryUsers.reduce(
      (acc, item) => ({
        users: acc.users + 1,
        taskCatalogs: acc.taskCatalogs + item.counts.taskCatalogs,
        itemCatalogs: acc.itemCatalogs + item.counts.itemCatalogs,
        workDivisions: acc.workDivisions + item.counts.workDivisions,
        total: acc.total + item.counts.total,
      }),
      {
        users: 0,
        taskCatalogs: 0,
        itemCatalogs: 0,
        workDivisions: 0,
        total: 0,
      },
    );

    return {
      totals,
      users: summaryUsers,
      recentAuditLogs: recentAuditLogs.map((auditLog) => new AuditLogEntity(auditLog)),
    };
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
