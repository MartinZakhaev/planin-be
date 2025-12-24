import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ValidationPipe } from '@nestjs/common';

describe('RabSummariesController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdRabSummaryId: string | undefined;
    let deletedRabSummaryId: string;

    // Dependencies
    let projectId: string;
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
                email: `rab_owner_${timestamp}@example.com`,
                fullName: 'RAB Summary Owner',
                passwordHash,
            }
        });
        userOwnerId = owner.id;

        // 2. Create Organization
        const org = await prisma.organization.create({
            data: {
                name: `RAB Org ${timestamp}`,
                code: `RABORG_${timestamp}`,
                ownerUserId: userOwnerId,
            }
        });
        organizationId = org.id;

        // 3. Create Project
        const project = await prisma.project.create({
            data: {
                organizationId,
                ownerUserId: userOwnerId,
                name: 'RAB Project',
            }
        });
        projectId = project.id;
    });

    afterAll(async () => {
        if (createdRabSummaryId) {
            await request(app.getHttpServer()).delete(`/rab-summaries/${createdRabSummaryId}`);
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

    it('/rab-summaries (POST)', () => {
        return request(app.getHttpServer())
            .post('/rab-summaries')
            .send({
                projectId,
                createdBy: userOwnerId,
                version: 1,
                subtotalMaterial: 1000,
                subtotalManpower: 500,
                subtotalTools: 200,
                taxableSubtotal: 1500,
                nontaxSubtotal: 200,
                taxRatePercent: 11,
                taxAmount: 165,
                grandTotal: 1865,
                notes: 'E2E Test RAB Summary',
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.projectId).toEqual(projectId);
                expect(res.body.createdBy).toEqual(userOwnerId);
                expect(res.body.notes).toEqual('E2E Test RAB Summary');
                createdRabSummaryId = res.body.id;
            });
    });

    it('/rab-summaries (GET)', () => {
        return request(app.getHttpServer())
            .get('/rab-summaries')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const summary = res.body.find((s) => s.id === createdRabSummaryId);
                expect(summary).toBeDefined();
            });
    });

    it('/rab-summaries/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/rab-summaries/${createdRabSummaryId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdRabSummaryId);
                expect(res.body.notes).toEqual('E2E Test RAB Summary');
            });
    });

    it('/rab-summaries/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/rab-summaries/${createdRabSummaryId}`)
            .send({ notes: 'Updated RAB Summary Notes' })
            .expect(200)
            .expect((res) => {
                expect(res.body.notes).toEqual('Updated RAB Summary Notes');
            });
    });

    it('/rab-summaries/:id (DELETE)', async () => {
        deletedRabSummaryId = createdRabSummaryId!;
        const response = await request(app.getHttpServer())
            .delete(`/rab-summaries/${createdRabSummaryId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedRabSummaryId);
        createdRabSummaryId = undefined;
    });

    it('/rab-summaries/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/rab-summaries/${deletedRabSummaryId}`)
            .expect(404);
    });
});
