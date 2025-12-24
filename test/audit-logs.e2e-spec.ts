import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ValidationPipe } from '@nestjs/common';

describe('AuditLogsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdAuditLogId: string | undefined;
    let deletedAuditLogId: string;

    // Optional dependencies
    let userOwnerId: string;

    const timestamp = Date.now();

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        prisma = app.get<PrismaService>(PrismaService);
        await app.init();

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('password123', salt);

        // 1. Create Optional User (for testing with user reference)
        const owner = await prisma.user.create({
            data: {
                email: `audit_user_${timestamp}@example.com`,
                fullName: 'Audit Log User',
                passwordHash,
            }
        });
        userOwnerId = owner.id;
    });

    afterAll(async () => {
        if (createdAuditLogId) {
            await request(app.getHttpServer()).delete(`/audit-logs/${createdAuditLogId}`);
        }

        if (userOwnerId) {
            await prisma.user.delete({ where: { id: userOwnerId } }).catch(() => { });
        }

        await app.close();
    });

    it('/audit-logs (POST)', () => {
        return request(app.getHttpServer())
            .post('/audit-logs')
            .send({
                userId: userOwnerId,
                action: 'CREATE',
                entityTable: 'projects',
                meta: { description: 'Created a new project' },
                ip: '127.0.0.1',
                userAgent: 'Test/1.0',
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.userId).toEqual(userOwnerId);
                expect(res.body.action).toEqual('CREATE');
                expect(res.body.entityTable).toEqual('projects');
                createdAuditLogId = res.body.id;
            });
    });

    it('/audit-logs (GET)', () => {
        return request(app.getHttpServer())
            .get('/audit-logs')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const auditLog = res.body.find((a) => a.id === createdAuditLogId);
                expect(auditLog).toBeDefined();
            });
    });

    it('/audit-logs/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/audit-logs/${createdAuditLogId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdAuditLogId);
                expect(res.body.action).toEqual('CREATE');
            });
    });

    it('/audit-logs/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/audit-logs/${createdAuditLogId}`)
            .send({ action: 'UPDATE' })
            .expect(200)
            .expect((res) => {
                expect(res.body.action).toEqual('UPDATE');
            });
    });

    it('/audit-logs/:id (DELETE)', async () => {
        deletedAuditLogId = createdAuditLogId!;
        const response = await request(app.getHttpServer())
            .delete(`/audit-logs/${createdAuditLogId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedAuditLogId);
        createdAuditLogId = undefined;
    });

    it('/audit-logs/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/audit-logs/${deletedAuditLogId}`)
            .expect(404);
    });
});
