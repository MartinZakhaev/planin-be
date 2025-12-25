import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const units = [
        // Length
        { code: 'M', name: 'Meter' },
        { code: 'M2', name: 'Meter Persegi' },
        { code: 'M3', name: 'Meter Kubik' },
        { code: 'CM', name: 'Centimeter' },
        { code: 'MM', name: 'Millimeter' },

        // Weight
        { code: 'KG', name: 'Kilogram' },
        { code: 'TON', name: 'Ton' },
        { code: 'GRAM', name: 'Gram' },

        // Quantity / Count
        { code: 'PCS', name: 'Pieces' },
        { code: 'UNIT', name: 'Unit' },
        { code: 'BH', name: 'Buah' },
        { code: 'SET', name: 'Set' },
        { code: 'TITIK', name: 'Titik' },
        { code: 'BTG', name: 'Batang' },
        { code: 'LBR', name: 'Lembar' },
        { code: 'PSG', name: 'Pasang' },
        { code: 'LUSIN', name: 'Lusin' },
        { code: 'GROS', name: 'Gross' },
        { code: 'KODI', name: 'Kodi' },
        { code: 'RIM', name: 'Rim' },

        // Volume
        { code: 'LTR', name: 'Liter' },
        { code: 'ML', name: 'Milliliter' },
        { code: 'DRM', name: 'Drum' },
        { code: 'GLN', name: 'Galon' },
        { code: 'TBG', name: 'Tabung' },
        { code: 'KLG', name: 'Kaleng' },

        // Packaging / Container
        { code: 'DOS', name: 'Dos' },
        { code: 'DUS', name: 'Dus' },
        { code: 'BKS', name: 'Bungkus' },
        { code: 'SAK', name: 'Sak' },
        { code: 'ROL', name: 'Roll' },
        { code: 'KRG', name: 'Karung' },
        { code: 'PAK', name: 'Pak' },
        { code: 'KOTAK', name: 'Kotak' },

        // Time
        { code: 'HARI', name: 'Hari' },
        { code: 'JAM', name: 'Jam' },
        { code: 'BLN', name: 'Bulan' },
        { code: 'THN', name: 'Tahun' },

        // Other
        { code: 'LS', name: 'Lumpsum' },
    ];

    console.log('Seeding Units...');

    for (const unit of units) {
        await prisma.unit.upsert({
            where: { code: unit.code },
            update: { name: unit.name },
            create: {
                code: unit.code,
                name: unit.name,
            },
        });
    }



    console.log('Units seeding completed.');

    // Superadmin Seeding
    console.log('Seeding Superadmin...');
    const superAdminEmail = 'superadmin@planin.com';

    try {
        const existingSuperAdmin = await prisma.user.findFirst({
            where: { email: superAdminEmail }
        });

        if (!existingSuperAdmin) {
            // Using Better Auth API to ensure password hashing and correct account creation
            // We need to import the auth instance
            const { auth } = await import('../src/auth/auth.js');

            // Generate a random mocked request context if needed, but the server API might not strict check origin for local calls
            // Note: signUpEmail returns a promise resolving to the response
            const res = await auth.api.signUpEmail({
                body: {
                    email: superAdminEmail,
                    password: 'password123', // Default password
                    name: 'Super Admin',
                }
            });

            if (res && res.user) {
                // Update role to superadmin (by default it's 'user')
                await prisma.user.update({
                    where: { id: res.user.id },
                    data: { role: 'superadmin' }
                });
                console.log(`Superadmin created: ${superAdminEmail} / password123`);
            } else {
                console.error('Failed to create superadmin: No user data returned from Auth API');
            }
        } else {
            console.log('Superadmin already exists. Skipping creation.');
            // Ensure role is superadmin just in case
            if (existingSuperAdmin.role !== 'superadmin') {
                await prisma.user.update({
                    where: { id: existingSuperAdmin.id },
                    data: { role: 'superadmin' }
                });
                console.log('Updated existing superadmin user role to superadmin.');
            }
        }
    } catch (error) {
        console.error('Error seeding superadmin:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
