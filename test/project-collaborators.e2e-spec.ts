import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('ProjectCollaboratorsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdCollaboratorId: string | undefined;
    let deletedCollaboratorId: string;

    // Dependencies
    let projectId: string;
    let collabUserId: string;
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
                email: `collab_owner_${timestamp}@example.com`,
                fullName: 'Project Owner for Collab',
                passwordHash,
            }
        });
        ownerUserId = owner.id;

        // 2. Create Collaborator User
        const collabUser = await prisma.user.create({
            data: {
                email: `collab_user_${timestamp}@example.com`,
                fullName: 'Collaborator User',
                passwordHash,
            }
        });
        collabUserId = collabUser.id;

        // 3. Create Organization
        const org = await prisma.organization.create({
            data: {
                name: `Collab Org ${timestamp}`,
                code: `CORG_${timestamp}`,
                ownerUserId,
            }
        });
        organizationId = org.id;

        // 4. Create Project
        const project = await prisma.project.create({
            data: {
                organizationId,
                ownerUserId,
                name: 'Collab Test Project',
            }
        });
        projectId = project.id;
    });

    afterAll(async () => {
        if (createdCollaboratorId) {
            await request(app.getHttpServer()).delete(`/project-collaborators/${createdCollaboratorId}`);
        }

        if (projectId) {
            await prisma.project.delete({ where: { id: projectId } }).catch(() => { });
        }
        if (organizationId) {
            await prisma.organization.delete({ where: { id: organizationId } }).catch(() => { });
        }
        if (ownerUserId) {
            await prisma.user.delete({ where: { id: ownerUserId } }).catch(() => { });
        }
        if (collabUserId) {
            await prisma.user.delete({ where: { id: collabUserId } }).catch(() => { });
        }

        await app.close();
    });

    it('/project-collaborators (POST)', () => {
        return request(app.getHttpServer())
            .post('/project-collaborators')
            .send({
                projectId,
                userId: collabUserId,
                role: 'EDITOR'
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.projectId).toEqual(projectId);
                expect(res.body.userId).toEqual(collabUserId);
                expect(res.body.role).toEqual('EDITOR');
                createdCollaboratorId = res.body.id;
            });
    });

    it('/project-collaborators (GET)', () => {
        return request(app.getHttpServer())
            .get('/project-collaborators')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const collab = res.body.find((c) => c.id === createdCollaboratorId);
                expect(collab).toBeDefined();
            });
    });

    it('/project-collaborators/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/project-collaborators/${createdCollaboratorId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdCollaboratorId);
                expect(res.body.userId).toEqual(collabUserId);
            });
    });

    it('/project-collaborators/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/project-collaborators/${createdCollaboratorId}`)
            .send({ role: 'VIEWER' })
            .expect(200)
            .expect((res) => {
                expect(res.body.role).toEqual('VIEWER');
            });
    });

    it('/project-collaborators/:id (DELETE)', async () => {
        deletedCollaboratorId = createdCollaboratorId!;
        const response = await request(app.getHttpServer())
            .delete(`/project-collaborators/${createdCollaboratorId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedCollaboratorId);
        createdCollaboratorId = undefined;
    });

    it('/project-collaborators/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/project-collaborators/${deletedCollaboratorId}`)
            .expect(404);
    });
});
