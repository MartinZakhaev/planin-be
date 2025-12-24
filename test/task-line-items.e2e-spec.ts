import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ValidationPipe } from '@nestjs/common';

describe('TaskLineItemsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdTaskLineItemId: string | undefined;
    let deletedTaskLineItemId: string;

    // Dependencies
    let projectId: string;
    let projectTaskId: string;
    let projectDivisionId: string;
    let taskCatalogId: string;
    let workDivisionId: string;
    let itemCatalogId: string;
    let unitId: string;
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
                email: `tli_owner_${timestamp}@example.com`,
                fullName: 'Task Line Item Owner',
                passwordHash,
            }
        });
        userOwnerId = owner.id;

        // 2. Create Organization
        const org = await prisma.organization.create({
            data: {
                name: `TLI Org ${timestamp}`,
                code: `TLIORG_${timestamp}`,
                ownerUserId: userOwnerId,
            }
        });
        organizationId = org.id;

        // 3. Create Project
        const project = await prisma.project.create({
            data: {
                organizationId,
                ownerUserId: userOwnerId,
                name: 'TLI Project',
            }
        });
        projectId = project.id;

        // 4. Create Unit
        const unit = await prisma.unit.create({
            data: {
                code: `UNIT_${timestamp}`,
                name: 'Test Unit',
            }
        });
        unitId = unit.id;

        // 5. Create WorkDivisionCatalog
        const workDiv = await prisma.workDivisionCatalog.create({
            data: {
                code: `WDIV_TLI_${timestamp}`,
                name: 'Work Div for TLI',
            }
        });
        workDivisionId = workDiv.id;

        // 6. Create TaskCatalog
        const taskCat = await prisma.taskCatalog.create({
            data: {
                divisionId: workDivisionId,
                code: `TCAT_TLI_${timestamp}`,
                name: 'Task Catalog for TLI',
            }
        });
        taskCatalogId = taskCat.id;

        // 7. Create ItemCatalog
        const itemCat = await prisma.itemCatalog.create({
            data: {
                code: `ITEM_${timestamp}`,
                name: 'Test Item Catalog',
                type: 'MATERIAL',
                unitId,
            }
        });
        itemCatalogId = itemCat.id;

        // 8. Create ProjectDivision
        const projDiv = await prisma.projectDivision.create({
            data: {
                projectId,
                divisionId: workDivisionId,
                displayName: 'Proj Div for TLI',
            }
        });
        projectDivisionId = projDiv.id;

        // 9. Create ProjectTask
        const projTask = await prisma.projectTask.create({
            data: {
                projectId,
                projectDivisionId,
                taskCatalogId,
                displayName: 'Project Task for TLI',
            }
        });
        projectTaskId = projTask.id;
    });

    afterAll(async () => {
        if (createdTaskLineItemId) {
            await request(app.getHttpServer()).delete(`/task-line-items/${createdTaskLineItemId}`);
        }

        if (projectTaskId) {
            await prisma.projectTask.delete({ where: { id: projectTaskId } }).catch(() => { });
        }
        if (projectDivisionId) {
            await prisma.projectDivision.delete({ where: { id: projectDivisionId } }).catch(() => { });
        }
        if (itemCatalogId) {
            await prisma.itemCatalog.delete({ where: { id: itemCatalogId } }).catch(() => { });
        }
        if (taskCatalogId) {
            await prisma.taskCatalog.delete({ where: { id: taskCatalogId } }).catch(() => { });
        }
        if (workDivisionId) {
            await prisma.workDivisionCatalog.delete({ where: { id: workDivisionId } }).catch(() => { });
        }
        if (unitId) {
            await prisma.unit.delete({ where: { id: unitId } }).catch(() => { });
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

    it('/task-line-items (POST)', () => {
        return request(app.getHttpServer())
            .post('/task-line-items')
            .send({
                projectId,
                projectTaskId,
                itemCatalogId,
                unitId,
                description: 'E2E Test Line Item',
                quantity: 10,
                unitPrice: 100,
                taxable: true,
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.projectId).toEqual(projectId);
                expect(res.body.projectTaskId).toEqual(projectTaskId);
                expect(res.body.description).toEqual('E2E Test Line Item');
                createdTaskLineItemId = res.body.id;
            });
    });

    it('/task-line-items (GET)', () => {
        return request(app.getHttpServer())
            .get('/task-line-items')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const item = res.body.find((i) => i.id === createdTaskLineItemId);
                expect(item).toBeDefined();
            });
    });

    it('/task-line-items/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/task-line-items/${createdTaskLineItemId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdTaskLineItemId);
                expect(res.body.description).toEqual('E2E Test Line Item');
            });
    });

    it('/task-line-items/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/task-line-items/${createdTaskLineItemId}`)
            .send({ description: 'Updated Line Item Description' })
            .expect(200)
            .expect((res) => {
                expect(res.body.description).toEqual('Updated Line Item Description');
            });
    });

    it('/task-line-items/:id (DELETE)', async () => {
        deletedTaskLineItemId = createdTaskLineItemId!;
        const response = await request(app.getHttpServer())
            .delete(`/task-line-items/${createdTaskLineItemId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedTaskLineItemId);
        createdTaskLineItemId = undefined;
    });

    it('/task-line-items/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/task-line-items/${deletedTaskLineItemId}`)
            .expect(404);
    });
});
