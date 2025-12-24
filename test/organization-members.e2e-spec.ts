import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('OrganizationMembersController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdMemberId: string | undefined;
    let deletedMemberId: string;

    // Dependencies
    let ownerUserId: string;
    let memberUserId: string;
    let organizationId: string;

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

        // 1. Create Owner User
        const owner = await prisma.user.create({
            data: {
                email: `org_owner_mem_${timestamp}@example.com`,
                fullName: 'Org Owner for Member Test',
                passwordHash,
            }
        });
        ownerUserId = owner.id;

        // 2. Create Organization
        const org = await prisma.organization.create({
            data: {
                name: 'Member Test Organization',
                code: `ORG_MEM_${timestamp}`,
                ownerUserId,
            }
        });
        organizationId = org.id;

        // 3. Create Member User
        const member = await prisma.user.create({
            data: {
                email: `org_member_${timestamp}@example.com`,
                fullName: 'Org Member User',
                passwordHash,
            }
        });
        memberUserId = member.id;
    });

    afterAll(async () => {
        // Cleanup Member if exists
        if (createdMemberId) {
            await request(app.getHttpServer()).delete(`/organization-members/${createdMemberId}`);
        }

        // Cleanup resources individually to handle foreign key constraints cleanly if possible,
        // or just let them remain if test env is reset.
        // For clean DB, delete in reverse order of creation/dependency.

        // Delete Organization (cascades to members usually, but we want explicit cleanup if needed)
        // Note: Organization delete might fail if members exist and cascade isn't set up, but let's try.
        if (organizationId) {
            await prisma.organization.delete({ where: { id: organizationId } }).catch(() => { });
        }

        // Delete Users
        if (ownerUserId) {
            await prisma.user.delete({ where: { id: ownerUserId } }).catch(() => { });
        }
        if (memberUserId) {
            await prisma.user.delete({ where: { id: memberUserId } }).catch(() => { });
        }

        await app.close();
    });

    it('/organization-members (POST)', () => {
        return request(app.getHttpServer())
            .post('/organization-members')
            .send({
                organizationId,
                userId: memberUserId,
                role: 'MEMBER'
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.organizationId).toEqual(organizationId);
                expect(res.body.userId).toEqual(memberUserId);
                expect(res.body.role).toEqual('MEMBER');
                createdMemberId = res.body.id;
            });
    });

    it('/organization-members (GET)', () => {
        return request(app.getHttpServer())
            .get('/organization-members')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const member = res.body.find((m) => m.id === createdMemberId);
                expect(member).toBeDefined();
            });
    });

    it('/organization-members/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/organization-members/${createdMemberId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdMemberId);
                expect(res.body.organizationId).toEqual(organizationId);
                expect(res.body.userId).toEqual(memberUserId);
            });
    });

    it('/organization-members/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/organization-members/${createdMemberId}`)
            .send({ role: 'ADMIN' })
            .expect(200)
            .expect((res) => {
                expect(res.body.role).toEqual('ADMIN');
            });
    });

    it('/organization-members/:id (DELETE)', async () => {
        deletedMemberId = createdMemberId!;

        const response = await request(app.getHttpServer())
            .delete(`/organization-members/${createdMemberId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedMemberId);
        createdMemberId = undefined;
    });

    it('/organization-members/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/organization-members/${deletedMemberId}`)
            .expect(404);
    });
});
