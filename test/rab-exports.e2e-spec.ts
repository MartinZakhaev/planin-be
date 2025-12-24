import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ValidationPipe } from '@nestjs/common';

describe('RabExportsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdRabExportId: string | undefined;
    let deletedRabExportId: string;

    // Dependencies
    let projectId: string;
    let rabSummaryId: string;
    let userOwnerId: string;
    let organizationId: string;

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

        // 1. Create Owner User
        const owner = await prisma.user.create({
            data: {
                email: `rabexp_owner_${timestamp}@example.com`,
                fullName: 'RAB Export Owner',
                passwordHash,
            }
        });
        userOwnerId = owner.id;

        // 2. Create Organization
        const org = await prisma.organization.create({
            data: {
                name: `RABExp Org ${timestamp}`,
                code: `RABEXPORG_${timestamp}`,
                ownerUserId: userOwnerId,
            }
        });
        organizationId = org.id;

        // 3. Create Project
        const project = await prisma.project.create({
            data: {
                organizationId,
                ownerUserId: userOwnerId,
                name: 'RAB Export Project',
            }
        });
        projectId = project.id;

        // 4. Create RabSummary
        const rabSummary = await prisma.rabSummary.create({
            data: {
                projectId,
                createdBy: userOwnerId,
                version: 1,
            }
        });
        rabSummaryId = rabSummary.id;
    });

    afterAll(async () => {
        if (createdRabExportId) {
            await request(app.getHttpServer()).delete(`/rab-exports/${createdRabExportId}`);
        }

        if (rabSummaryId) {
            await prisma.rabSummary.delete({ where: { id: rabSummaryId } }).catch(() => { });
        }
        if (projectId) {
            await prisma.project.delete({ where: { id: projectId } }).catch(() => { });
        }
        if (organizationId) {
            await prisma.organization.delete({ where: { id: organizationId } }).catch(() => { });
        }
        if (userOwnerId) {
            await prisma.user.delete({ where: { id: userOwnerId } }).catch(() => { });
        }

        await app.close();
    });

    it('/rab-exports (POST)', () => {
        return request(app.getHttpServer())
            .post('/rab-exports')
            .send({
                rabSummaryId,
                projectId,
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.rabSummaryId).toEqual(rabSummaryId);
                expect(res.body.projectId).toEqual(projectId);
                createdRabExportId = res.body.id;
            });
    });

    it('/rab-exports (GET)', () => {
        return request(app.getHttpServer())
            .get('/rab-exports')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const rabExport = res.body.find((r) => r.id === createdRabExportId);
                expect(rabExport).toBeDefined();
            });
    });

    it('/rab-exports/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/rab-exports/${createdRabExportId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdRabExportId);
                expect(res.body.rabSummaryId).toEqual(rabSummaryId);
            });
    });

    it('/rab-exports/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/rab-exports/${createdRabExportId}`)
            .send({ pdfFileId: null })
            .expect(200)
            .expect((res) => {
                expect(res.body.pdfFileId).toBeNull();
            });
    });

    it('/rab-exports/:id (DELETE)', async () => {
        deletedRabExportId = createdRabExportId!;
        const response = await request(app.getHttpServer())
            .delete(`/rab-exports/${createdRabExportId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedRabExportId);
        createdRabExportId = undefined;
    });

    it('/rab-exports/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/rab-exports/${deletedRabExportId}`)
            .expect(404);
    });
});
