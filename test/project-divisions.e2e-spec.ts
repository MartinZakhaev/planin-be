import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('ProjectDivisionsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdProjectDivisionId: string | undefined;
    let deletedProjectDivisionId: string;

    // Dependencies
    let projectId: string;
    let divisionId: string;
    let ownerUserId: string;
    let organizationId: string;

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
        const owner = await prisma.user.create({
            data: {
                email: `div_owner_${timestamp}@example.com`,
                fullName: 'Project Owner for Division',
                passwordHash,
            }
        });
        ownerUserId = owner.id;

        // 2. Create Organization
        const org = await prisma.organization.create({
            data: {
                name: `Div Org ${timestamp}`,
                code: `DORG_${timestamp}`,
                ownerUserId,
            }
        });
        organizationId = org.id;

        // 3. Create Project
        const project = await prisma.project.create({
            data: {
                organizationId,
                ownerUserId,
                name: 'Division Test Project',
            }
        });
        projectId = project.id;

        // 4. Create WorkDivisionCatalog
        const catalog = await prisma.workDivisionCatalog.create({
            data: {
                code: `PDIV_${timestamp}`,
                name: 'Project Division Catalog',
            }
        });
        divisionId = catalog.id;
    });

    afterAll(async () => {
        if (createdProjectDivisionId) {
            await request(app.getHttpServer()).delete(`/project-divisions/${createdProjectDivisionId}`);
        }

        if (projectId) {
            await prisma.project.delete({ where: { id: projectId } }).catch(() => { });
        }
        if (divisionId) {
            await prisma.workDivisionCatalog.delete({ where: { id: divisionId } }).catch(() => { });
        }
        if (organizationId) {
            await prisma.organization.delete({ where: { id: organizationId } }).catch(() => { });
        }
        if (ownerUserId) {
            await prisma.user.delete({ where: { id: ownerUserId } }).catch(() => { });
        }

        await app.close();
    });

    it('/project-divisions (POST)', () => {
        return request(app.getHttpServer())
            .post('/project-divisions')
            .send({
                projectId,
                divisionId,
                displayName: 'E2E Test Project Division',
                sortOrder: 1
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.projectId).toEqual(projectId);
                expect(res.body.divisionId).toEqual(divisionId);
                expect(res.body.displayName).toEqual('E2E Test Project Division');
                createdProjectDivisionId = res.body.id;
            });
    });

    it('/project-divisions (GET)', () => {
        return request(app.getHttpServer())
            .get('/project-divisions')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const div = res.body.find((d) => d.id === createdProjectDivisionId);
                expect(div).toBeDefined();
            });
    });

    it('/project-divisions/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/project-divisions/${createdProjectDivisionId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdProjectDivisionId);
                expect(res.body.displayName).toEqual('E2E Test Project Division');
            });
    });

    it('/project-divisions/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/project-divisions/${createdProjectDivisionId}`)
            .send({ displayName: 'Updated Display Name' })
            .expect(200)
            .expect((res) => {
                expect(res.body.displayName).toEqual('Updated Display Name');
            });
    });

    it('/project-divisions/:id (DELETE)', async () => {
        deletedProjectDivisionId = createdProjectDivisionId!;
        const response = await request(app.getHttpServer())
            .delete(`/project-divisions/${createdProjectDivisionId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedProjectDivisionId);
        createdProjectDivisionId = undefined;
    });

    it('/project-divisions/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/project-divisions/${deletedProjectDivisionId}`)
            .expect(404);
    });
});
