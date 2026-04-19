// Load environment variables FIRST before any other imports
import 'dotenv/config';

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Create a dedicated Prisma client for Better Auth
 * This is separate from NestJS's PrismaService to avoid circular dependencies
 */
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Better Auth Configuration
 *
 * - basePath: All auth endpoints will be prefixed with /api/auth
 * - database: Uses Prisma with PostgreSQL adapter
 * - emailAndPassword: Enables email/password authentication
 *
 * NOTE: Role management is handled separately via our own API/hooks
 * (use-roles.ts, roles page, etc.) - not through better-auth admin plugin
 *
 * When a new user signs up, they get the default 'user' role via
 * the frontend calling /users/{id}/assign-role after account creation.
 */
export const auth = betterAuth({
    basePath: '/api/auth',
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        modelName: 'User',
        fields: {
            email: 'email',
            name: 'fullName',
            image: 'image',
        },
    },
    session: {
        modelName: 'Session',
    },
    account: {
        modelName: 'Account',
    },
    plugins: [
        // Admin plugin removed - role management is handled separately
        // via our own use-roles.ts hook and Role CRUD API
    ],
    trustedOrigins: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.BETTER_AUTH_URL || 'http://localhost:3001',
    ],
});

export type Auth = typeof auth;