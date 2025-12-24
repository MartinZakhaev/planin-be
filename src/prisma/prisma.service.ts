import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;

    constructor() {
        // 1. Buat Connection Pool PostgreSQL
        const connectionString = `${process.env.DATABASE_URL}`;
        const pool = new Pool({ connectionString });

        // 2. Buat Adapter (bedanya di sini, PG butuh instance pool)
        const adapter = new PrismaPg(pool);

        // 3. Pass adapter ke super() agar PrismaClient menggunakannya
        super({ adapter });

        // Store pool reference for cleanup
        this.pool = pool;
    }

    async onModuleInit() {
        // Tetap panggil $connect() untuk inisialisasi koneksi Prisma saat modul start
        await this.$connect();
    }

    async onModuleDestroy() {
        // Properly disconnect Prisma and close the pool
        await this.$disconnect();
        await this.pool.end();
    }
}