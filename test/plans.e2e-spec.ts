import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('PlansController (e2e)', () => {
    let app: INestApplication;
    let createdPlanId: string | undefined;
    let deletedPlanId: string;

    const timestamp = Date.now();
    const newPlan = {
        code: `PLAN_${timestamp}`,
        name: 'E2E Test Plan',
        priceCents: 100000,
        currency: 'IDR',
        interval: 'monthly',
        maxProjects: 15
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (createdPlanId) {
            await request(app.getHttpServer()).delete(`/plans/${createdPlanId}`);
        }
        await app.close();
    });

    it('/plans (POST)', () => {
        return request(app.getHttpServer())
            .post('/plans')
            .send(newPlan)
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.code).toEqual(newPlan.code);
                expect(res.body.name).toEqual(newPlan.name);
                expect(res.body.priceCents).toEqual(newPlan.priceCents);
                createdPlanId = res.body.id;
            });
    });

    it('/plans (GET)', () => {
        return request(app.getHttpServer())
            .get('/plans')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const plan = res.body.find((p) => p.id === createdPlanId);
                expect(plan).toBeDefined();
            });
    });

    it('/plans/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/plans/${createdPlanId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdPlanId);
                expect(res.body.code).toEqual(newPlan.code);
            });
    });

    it('/plans/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/plans/${createdPlanId}`)
            .send({ name: 'Updated Plan Name' })
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toEqual('Updated Plan Name');
            });
    });

    it('/plans/:id (DELETE)', async () => {
        deletedPlanId = createdPlanId!;
        const response = await request(app.getHttpServer())
            .delete(`/plans/${createdPlanId}`)
            .expect(200);

        expect(response.body.id).toEqual(createdPlanId);
        createdPlanId = undefined;
    });

    it('/plans/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/plans/${deletedPlanId}`)
            .expect(404);
    });
});
