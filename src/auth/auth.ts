// Load environment variables FIRST before any other imports
import 'dotenv/config';

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ac, superadmin, adminRole, staff, user } from './permissions';

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
 * - plugins: Admin plugin with RBAC configuration
 * - hooks: Empty object required for NestJS hook decorators
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
        admin({
            ac,
            roles: {
                superadmin,
                admin: adminRole,
                staff,
                user,
            },
            defaultRole: 'user',
        }),
    ],
    hooks: {},
    trustedOrigins: [
        'http://localhost:3000', // Next.js frontend
        process.env.BETTER_AUTH_URL || 'http://localhost:3001',
    ],
});

export type Auth = typeof auth;
