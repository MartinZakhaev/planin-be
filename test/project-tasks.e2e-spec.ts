import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ValidationPipe } from '@nestjs/common';

describe('ProjectTasksController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdProjectTaskId: string | undefined;
    let deletedProjectTaskId: string;

    // Dependencies
    let projectId: string;
    let projectDivisionId: string;
    let taskCatalogId: string;
    let workDivisionId: string;
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
                email: `ptask_owner_${timestamp}@example.com`,
                fullName: 'Project Task Owner',
                passwordHash,
            }
        });
        userOwnerId = owner.id;

        // 2. Create Organization
        const org = await prisma.organization.create({
            data: {
                name: `PTask Org ${timestamp}`,
                code: `PTORG_${timestamp}`,
                ownerUserId: userOwnerId,
            }
        });
        organizationId = org.id;

        // 3. Create Project
        const project = await prisma.project.create({
            data: {
                organizationId,
                ownerUserId: userOwnerId,
                name: 'PTask Project',
            }
        });
        projectId = project.id;

        // 4. Create WorkDivisionCatalog
        const workDiv = await prisma.workDivisionCatalog.create({
            data: {
                code: `WDIV_${timestamp}`,
                name: 'Work Div for Task',
            }
        });
        workDivisionId = workDiv.id;

        // 5. Create TaskCatalog
        const taskCat = await prisma.taskCatalog.create({
            data: {
                divisionId: workDivisionId,
                code: `TCAT_${timestamp}`,
                name: 'Task Catalog Item',
            }
        });
        taskCatalogId = taskCat.id;

        // 6. Create ProjectDivision
        const projDiv = await prisma.projectDivision.create({
            data: {
                projectId,
                divisionId: workDivisionId,
                displayName: 'Proj Div 1',
            }
        });
        projectDivisionId = projDiv.id;
        console.log('Setup IDs:', { projectId, taskCatalogId, projectDivisionId, workDivisionId, organizationId });
    });

    afterAll(async () => {
        if (createdProjectTaskId) {
            await request(app.getHttpServer()).delete(`/project-tasks/${createdProjectTaskId}`);
        }

        if (projectDivisionId) {
            await prisma.projectDivision.delete({ where: { id: projectDivisionId } }).catch(() => { });
        }
        if (taskCatalogId) {
            await prisma.taskCatalog.delete({ where: { id: taskCatalogId } }).catch(() => { });
        }
        if (workDivisionId) {
            await prisma.workDivisionCatalog.delete({ where: { id: workDivisionId } }).catch(() => { });
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

    it('/project-tasks (POST)', () => {
        return request(app.getHttpServer())
            .post('/project-tasks')
            .send({
                projectId,
                projectDivisionId,
                taskCatalogId,
                displayName: 'E2E Test Project Task',
                sortOrder: 1,
                notes: 'Some notes'
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.projectId).toEqual(projectId);
                expect(res.body.taskCatalogId).toEqual(taskCatalogId);
                expect(res.body.displayName).toEqual('E2E Test Project Task');
                createdProjectTaskId = res.body.id;
            });
    });

    it('/project-tasks (GET)', () => {
        return request(app.getHttpServer())
            .get('/project-tasks')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const task = res.body.find((t) => t.id === createdProjectTaskId);
                expect(task).toBeDefined();
            });
    });

    it('/project-tasks/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/project-tasks/${createdProjectTaskId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdProjectTaskId);
                expect(res.body.displayName).toEqual('E2E Test Project Task');
            });
    });

    it('/project-tasks/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/project-tasks/${createdProjectTaskId}`)
            .send({ displayName: 'Updated Task Display Name' })
            .expect(200)
            .expect((res) => {
                expect(res.body.displayName).toEqual('Updated Task Display Name');
            });
    });

    it('/project-tasks/:id (DELETE)', async () => {
        deletedProjectTaskId = createdProjectTaskId!;
        const response = await request(app.getHttpServer())
            .delete(`/project-tasks/${createdProjectTaskId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedProjectTaskId);
        createdProjectTaskId = undefined;
    });

    it('/project-tasks/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/project-tasks/${deletedProjectTaskId}`)
            .expect(404);
    });
});
