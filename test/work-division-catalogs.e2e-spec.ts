import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('WorkDivisionCatalogsController (e2e)', () => {
    let app: INestApplication;
    let createdCatalogId: string | undefined;
    let deletedCatalogId: string;

    const timestamp = Date.now();
    const newCatalog = {
        code: `DIV_${timestamp}`,
        name: 'E2E Test Division',
        description: 'Test Description'
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (createdCatalogId) {
            await request(app.getHttpServer()).delete(`/work-division-catalogs/${createdCatalogId}`);
        }
        await app.close();
    });

    it('/work-division-catalogs (POST)', () => {
        return request(app.getHttpServer())
            .post('/work-division-catalogs')
            .send(newCatalog)
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.code).toEqual(newCatalog.code);
                expect(res.body.name).toEqual(newCatalog.name);
                createdCatalogId = res.body.id;
            });
    });

    it('/work-division-catalogs (GET)', () => {
        return request(app.getHttpServer())
            .get('/work-division-catalogs')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const catalog = res.body.find((c) => c.id === createdCatalogId);
                expect(catalog).toBeDefined();
            });
    });

    it('/work-division-catalogs/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/work-division-catalogs/${createdCatalogId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdCatalogId);
                expect(res.body.code).toEqual(newCatalog.code);
            });
    });

    it('/work-division-catalogs/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/work-division-catalogs/${createdCatalogId}`)
            .send({ name: 'Updated Division Name' })
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toEqual('Updated Division Name');
            });
    });

    it('/work-division-catalogs/:id (DELETE)', async () => {
        deletedCatalogId = createdCatalogId!;
        const response = await request(app.getHttpServer())
            .delete(`/work-division-catalogs/${createdCatalogId}`)
            .expect(200);

        expect(response.body.id).toEqual(createdCatalogId);
        createdCatalogId = undefined;
    });

    it('/work-division-catalogs/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/work-division-catalogs/${deletedCatalogId}`)
            .expect(404);
    });
});
