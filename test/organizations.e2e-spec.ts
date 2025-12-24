import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('OrganizationsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdOrganizationId: string | undefined;
    let deletedOrganizationId: string;
    let ownerUserId: string;

    const timestamp = Date.now();
    const newOrganization = {
        name: 'E2E Test Organization',
        code: `ORG_${timestamp}`,
        ownerUserId: '', // Will be set in beforeAll
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        // Use PrismaService to create a dummy user directly
        prisma = app.get<PrismaService>(PrismaService);
        await app.init();

        // Create a user to be the owner
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('password123', salt);

        const user = await prisma.user.create({
            data: {
                email: `org_owner_${timestamp}@example.com`,
                fullName: 'Org Owner User',
                passwordHash,
            }
        });
        ownerUserId = user.id;
        newOrganization.ownerUserId = ownerUserId;
    });

    afterAll(async () => {
        // Cleanup organization if exists
        if (createdOrganizationId) {
            await request(app.getHttpServer()).delete(`/organizations/${createdOrganizationId}`);
        }

        // Cleanup user
        if (ownerUserId) {
            await prisma.user.delete({ where: { id: ownerUserId } }).catch(() => { });
        }

        await app.close();
    });

    it('/organizations (POST)', () => {
        return request(app.getHttpServer())
            .post('/organizations')
            .send(newOrganization)
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.name).toEqual(newOrganization.name);
                expect(res.body.code).toEqual(newOrganization.code);
                expect(res.body.ownerUserId).toEqual(ownerUserId);
                createdOrganizationId = res.body.id;
            });
    });

    it('/organizations (GET)', () => {
        return request(app.getHttpServer())
            .get('/organizations')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const organization = res.body.find((o) => o.id === createdOrganizationId);
                expect(organization).toBeDefined();
            });
    });

    it('/organizations/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/organizations/${createdOrganizationId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdOrganizationId);
                expect(res.body.name).toEqual(newOrganization.name);
                expect(res.body.ownerUserId).toEqual(ownerUserId);
            });
    });

    it('/organizations/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/organizations/${createdOrganizationId}`)
            .send({ name: 'Updated Organization Name' })
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toEqual('Updated Organization Name');
            });
    });

    it('/organizations/:id (DELETE)', async () => {
        // Store ID before deleting for verification test
        deletedOrganizationId = createdOrganizationId!;

        const response = await request(app.getHttpServer())
            .delete(`/organizations/${createdOrganizationId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedOrganizationId);
        createdOrganizationId = undefined;
    });

    it('/organizations/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/organizations/${deletedOrganizationId}`)
            .expect(404);
    });
});
