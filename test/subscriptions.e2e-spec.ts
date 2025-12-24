import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('SubscriptionsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdSubscriptionId: string | undefined;
    let deletedSubscriptionId: string;

    // Dependencies
    let userId: string;
    let planId: string;

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

        // 1. Create User
        const user = await prisma.user.create({
            data: {
                email: `sub_user_${timestamp}@example.com`,
                fullName: 'Subscription User',
                passwordHash,
            }
        });
        userId = user.id;

        // 2. Create Plan
        const plan = await prisma.plan.create({
            data: {
                code: `SUB_PLAN_${timestamp}`,
                name: 'Subscription Test Plan',
                priceCents: 50000,
            }
        });
        planId = plan.id;
    });

    afterAll(async () => {
        if (createdSubscriptionId) {
            await request(app.getHttpServer()).delete(`/subscriptions/${createdSubscriptionId}`);
        }

        if (userId) {
            await prisma.user.delete({ where: { id: userId } }).catch(() => { });
        }
        if (planId) {
            await prisma.plan.delete({ where: { id: planId } }).catch(() => { });
        }

        await app.close();
    });

    it('/subscriptions (POST)', () => {
        return request(app.getHttpServer())
            .post('/subscriptions')
            .send({
                userId,
                planId,
                status: 'ACTIVE'
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.userId).toEqual(userId);
                expect(res.body.planId).toEqual(planId);
                expect(res.body.status).toEqual('ACTIVE');
                createdSubscriptionId = res.body.id;
            });
    });

    it('/subscriptions (GET)', () => {
        return request(app.getHttpServer())
            .get('/subscriptions')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const sub = res.body.find((s) => s.id === createdSubscriptionId);
                expect(sub).toBeDefined();
            });
    });

    it('/subscriptions/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/subscriptions/${createdSubscriptionId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdSubscriptionId);
                expect(res.body.userId).toEqual(userId);
                expect(res.body.planId).toEqual(planId);
            });
    });

    it('/subscriptions/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/subscriptions/${createdSubscriptionId}`)
            .send({ status: 'CANCELED' })
            .expect(200)
            .expect((res) => {
                expect(res.body.status).toEqual('CANCELED');
            });
    });

    it('/subscriptions/:id (DELETE)', async () => {
        deletedSubscriptionId = createdSubscriptionId!;
        const response = await request(app.getHttpServer())
            .delete(`/subscriptions/${createdSubscriptionId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedSubscriptionId);
        createdSubscriptionId = undefined;
    });

    it('/subscriptions/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/subscriptions/${deletedSubscriptionId}`)
            .expect(404);
    });
});
