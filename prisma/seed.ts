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
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
