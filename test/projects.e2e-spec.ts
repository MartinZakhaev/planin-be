import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('ProjectsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdProjectId: string | undefined;
    let deletedProjectId: string;

    // Dependencies
    let organizationId: string;
    let ownerUserId: string;

    const timestamp = Date.now();

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get<PrismaService>(PrismaService);
        await app.init();

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('password123', salt);

        // 1. Create Owner User
        const user = await prisma.user.create({
            data: {
                email: `project_owner_${timestamp}@example.com`,
                fullName: 'Project Owner',
                passwordHash,
            }
        });
        ownerUserId = user.id;

        // 2. Create Organization
        const org = await prisma.organization.create({
            data: {
                name: `Project Org ${timestamp}`,
                code: `PORG_${timestamp}`,
                ownerUserId,
            }
        });
        organizationId = org.id;
    });

    afterAll(async () => {
        if (createdProjectId) {
            await request(app.getHttpServer()).delete(`/projects/${createdProjectId}`);
        }

        if (organizationId) {
            await prisma.organization.delete({ where: { id: organizationId } }).catch(() => { });
        }
        if (ownerUserId) {
            await prisma.user.delete({ where: { id: ownerUserId } }).catch(() => { });
        }

        await app.close();
    });

    it('/projects (POST)', () => {
        return request(app.getHttpServer())
            .post('/projects')
            .send({
                organizationId,
                ownerUserId,
                name: 'E2E Test Project',
                code: `PROJ_${timestamp}`,
                description: 'Test Description',
                location: 'Jakarta',
                taxRatePercent: 11,
                currency: 'IDR'
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.organizationId).toEqual(organizationId);
                expect(res.body.name).toEqual('E2E Test Project');
                createdProjectId = res.body.id;
            });
    });

    it('/projects (GET)', () => {
        return request(app.getHttpServer())
            .get('/projects')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const project = res.body.find((p) => p.id === createdProjectId);
                expect(project).toBeDefined();
            });
    });

    it('/projects/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/projects/${createdProjectId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdProjectId);
                expect(res.body.code).toEqual(`PROJ_${timestamp}`);
            });
    });

    it('/projects/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/projects/${createdProjectId}`)
            .send({ name: 'Updated Project Name' })
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toEqual('Updated Project Name');
            });
    });

    it('/projects/:id (DELETE)', async () => {
        deletedProjectId = createdProjectId!;
        const response = await request(app.getHttpServer())
            .delete(`/projects/${createdProjectId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedProjectId);
        createdProjectId = undefined;
    });

    it('/projects/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/projects/${deletedProjectId}`)
            .expect(404);
    });
});
