import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UnitsController (e2e)', () => {
    let app: INestApplication;
    let createdUnitId: string | undefined;
    let deletedUnitId: string;
    const timestamp = Date.now();
    const newUnit = {
        code: `U_${timestamp}`,
        name: 'E2E Test Unit',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (createdUnitId) {
            await request(app.getHttpServer()).delete(`/units/${createdUnitId}`);
        }
        await app.close();
    });

    it('/units (POST)', () => {
        return request(app.getHttpServer())
            .post('/units')
            .send(newUnit)
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.code).toEqual(newUnit.code);
                expect(res.body.name).toEqual(newUnit.name);
                createdUnitId = res.body.id;
            });
    });

    it('/units (GET)', () => {
        return request(app.getHttpServer())
            .get('/units')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const unit = res.body.find((u) => u.id === createdUnitId);
                expect(unit).toBeDefined();
            });
    });

    it('/units/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/units/${createdUnitId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdUnitId);
                expect(res.body.code).toEqual(newUnit.code);
            });
    });

    it('/units/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/units/${createdUnitId}`)
            .send({ name: 'Updated E2E Unit Name' })
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toEqual('Updated E2E Unit Name');
            });
    });

    it('/units/:id (DELETE)', async () => {
        // Store the ID before clearing for the "Fail on deleted" test
        deletedUnitId = createdUnitId!;

        const response = await request(app.getHttpServer())
            .delete(`/units/${createdUnitId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedUnitId);
        // Clear the ID so afterAll doesn't try to delete again
        createdUnitId = undefined;
    });

    it('/units/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/units/${deletedUnitId}`)
            .expect(404);
    });
});
