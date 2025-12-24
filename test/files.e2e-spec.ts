import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ValidationPipe } from '@nestjs/common';

describe('FilesController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let createdFileId: string | undefined;
    let deletedFileId: string;

    // Dependencies
    let userOwnerId: string;

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
                email: `file_owner_${timestamp}@example.com`,
                fullName: 'File Owner',
                passwordHash,
            }
        });
        userOwnerId = owner.id;
    });

    afterAll(async () => {
        if (createdFileId) {
            await request(app.getHttpServer()).delete(`/files/${createdFileId}`);
        }

        if (userOwnerId) {
            await prisma.user.delete({ where: { id: userOwnerId } }).catch(() => { });
        }

        await app.close();
    });

    it('/files (POST)', () => {
        return request(app.getHttpServer())
            .post('/files')
            .send({
                ownerUserId: userOwnerId,
                filename: 'test-file.pdf',
                storagePath: '/uploads/test-file.pdf',
                kind: 'DOCUMENT',
                mimeType: 'application/pdf',
                sizeBytes: 1024,
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.ownerUserId).toEqual(userOwnerId);
                expect(res.body.filename).toEqual('test-file.pdf');
                expect(res.body.kind).toEqual('DOCUMENT');
                createdFileId = res.body.id;
            });
    });

    it('/files (GET)', () => {
        return request(app.getHttpServer())
            .get('/files')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const file = res.body.find((f) => f.id === createdFileId);
                expect(file).toBeDefined();
            });
    });

    it('/files/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/files/${createdFileId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdFileId);
                expect(res.body.filename).toEqual('test-file.pdf');
            });
    });

    it('/files/:id (PATCH)', () => {
        return request(app.getHttpServer())
            .patch(`/files/${createdFileId}`)
            .send({ filename: 'updated-file.pdf' })
            .expect(200)
            .expect((res) => {
                expect(res.body.filename).toEqual('updated-file.pdf');
            });
    });

    it('/files/:id (DELETE)', async () => {
        deletedFileId = createdFileId!;
        const response = await request(app.getHttpServer())
            .delete(`/files/${createdFileId}`)
            .expect(200);

        expect(response.body.id).toEqual(deletedFileId);
        createdFileId = undefined;
    });

    it('/files/:id (GET) - Fail on deleted', () => {
        return request(app.getHttpServer())
            .get(`/files/${deletedFileId}`)
            .expect(404);
    });
});
