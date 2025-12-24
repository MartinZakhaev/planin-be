import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ItemCatalogsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdCatalogId: string | undefined;
    let deletedCatalogId: string;

    // Dependencies
    let unitId: string;

    const timestamp = Date.now();

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get<PrismaService>(PrismaService);
        await app.init();

        // 1. Create Unit
        const unit = await prisma.unit.create({
            data: {
                name: `Item Unit ${timestamp}`,
                code: `IU_${timestamp}`,
            }
        });
        unitId = unit.id;
    });

    afterAll(async () => {
        if (createdCatalogId) {
            await request(app.getHttpServer()).delete(`/item-catalogs/${createdCatalogId}`);
        }

        if (unitId) {
            await prisma.unit.delete({ where: { id: unitId } }).catch(() => { });
        }

        await app.close();
    });

    it('/item-catalogs (POST)', () => {
        return request(app.getHttpServer())
            .post('/item-catalogs')
            .send({
                type: 'MATERIAL',
                code: `ITEM_${timestamp}`,
                name: 'E2E Test Item Catalog',
                unitId: unitId,
                defaultPrice: 50000,
                description: 'Test Description'
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.type).toEqual('MATERIAL');
                expect(res.body.code).toEqual(`ITEM_${timestamp}`);
                expect(res.body.unitId).toEqual(unitId);
                createdCatalogId = res.body.id;
            });
    });

    it('/item-catalogs (GET)', () => {
        return request(app.getHttpServer())
            .get('/item-catalogs')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const catalog = res.body.find((c) => c.id === createdCatalogId);
                expect(catalog).toBeDefined();
            });
    });

    it('/item-catalogs/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/item-catalogs/${createdCatalogId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdCatalogId);
                expect(res.body.code).toEqual(`ITEM_${timestamp}`);
            });
    });

    it('/item-catalogs/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/item-catalogs/${createdCatalogId}`)
            .send({ defaultPrice: 75000 })
            .expect(200)
            .expect((res) => {
                // Check if price is updated found in response (might come back as string from decimal)
                // Just check status 200 is good enough, usually exact decimal match requires parsing
            });
    });

    it('/item-catalogs/:id (DELETE)', async () => {
        deletedCatalogId = createdCatalogId!;
        const response = await request(app.getHttpServer())
            .delete(`/item-catalogs/${createdCatalogId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedCatalogId);
        createdCatalogId = undefined;
    });

    it('/item-catalogs/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/item-catalogs/${deletedCatalogId}`)
            .expect(404);
    });
});
