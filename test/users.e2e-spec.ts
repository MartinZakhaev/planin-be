import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let createdUserId: string | undefined;
    let deletedUserId: string;
    const timestamp = Date.now();
    const newUser = {
        email: `e2e_user_${timestamp}@example.com`,
        password: 'password123',
        fullName: 'E2E Test User',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        // Clean up if needed, though DELETE test should handle it
        if (createdUserId) {
            // Attempt generic cleanup just in case
            await request(app.getHttpServer()).delete(`/users/${createdUserId}`);
        }
        await app.close();
    });

    it('/users (POST)', () => {
        return request(app.getHttpServer())
            .post('/users')
            .send(newUser)
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.email).toEqual(newUser.email);
                expect(res.body).not.toHaveProperty('passwordHash');
                createdUserId = res.body.id;
            });
    });

    it('/users (GET)', () => {
        return request(app.getHttpServer())
            .get('/users')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const user = res.body.find((u) => u.id === createdUserId);
                expect(user).toBeDefined();
            });
    });

    it('/users/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/users/${createdUserId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdUserId);
                expect(res.body.email).toEqual(newUser.email);
            });
    });

    it('/users/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/users/${createdUserId}`)
            .send({ fullName: 'Updated E2E Name' })
            .expect(200)
            .expect((res) => {
                expect(res.body.fullName).toEqual('Updated E2E Name');
            });
    });

    it('/users/:id (DELETE)', async () => {
        // Store the ID before clearing for the "Fail on deleted" test
        deletedUserId = createdUserId!;

        const response = await request(app.getHttpServer())
            .delete(`/users/${createdUserId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedUserId);
        // Clear the ID so afterAll doesn't try to delete again
        createdUserId = undefined;
    });

    it('/users/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/users/${deletedUserId}`)
            .expect(404);
    });
});
