import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TaskCatalogsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdCatalogId: string | undefined;
    let deletedCatalogId: string;

    // Dependencies
    let divisionId: string;

    const timestamp = Date.now();

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get<PrismaService>(PrismaService);
        await app.init();

        // 1. Create Work Division
        const division = await prisma.workDivisionCatalog.create({
            data: {
                code: `TASK_DIV_${timestamp}`,
                name: 'Division for Task Catalog',
            }
        });
        divisionId = division.id;
    });

    afterAll(async () => {
        if (createdCatalogId) {
            await request(app.getHttpServer()).delete(`/task-catalogs/${createdCatalogId}`);
        }

        if (divisionId) {
            await prisma.workDivisionCatalog.delete({ where: { id: divisionId } }).catch(() => { });
        }

        await app.close();
    });

    it('/task-catalogs (POST)', () => {
        return request(app.getHttpServer())
            .post('/task-catalogs')
            .send({
                divisionId,
                code: `TASK_${timestamp}`,
                name: 'E2E Test Task Catalog',
                description: 'Test Description'
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.divisionId).toEqual(divisionId);
                expect(res.body.code).toEqual(`TASK_${timestamp}`);
                createdCatalogId = res.body.id;
            });
    });

    it('/task-catalogs (GET)', () => {
        return request(app.getHttpServer())
            .get('/task-catalogs')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const catalog = res.body.find((c) => c.id === createdCatalogId);
                expect(catalog).toBeDefined();
            });
    });

    it('/task-catalogs/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/task-catalogs/${createdCatalogId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdCatalogId);
                expect(res.body.divisionId).toEqual(divisionId);
            });
    });

    it('/task-catalogs/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/task-catalogs/${createdCatalogId}`)
            .send({ name: 'Updated Task Catalog Name' })
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toEqual('Updated Task Catalog Name');
            });
    });

    it('/task-catalogs/:id (DELETE)', async () => {
        deletedCatalogId = createdCatalogId!;
        const response = await request(app.getHttpServer())
            .delete(`/task-catalogs/${createdCatalogId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedCatalogId);
        createdCatalogId = undefined;
    });

    it('/task-catalogs/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/task-catalogs/${deletedCatalogId}`)
            .expect(404);
    });
});
