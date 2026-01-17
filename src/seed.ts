import { PrismaClient, ItemType } from './generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting comprehensive seeding...\n');

    // ==========================================
    // 1. SEED UNITS
    // ==========================================
    console.log('📏 Seeding Units...');
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
        // Quantity
        { code: 'PCS', name: 'Pieces' },
        { code: 'UNIT', name: 'Unit' },
        { code: 'BH', name: 'Buah' },
        { code: 'SET', name: 'Set' },
        { code: 'TITIK', name: 'Titik' },
        { code: 'BTG', name: 'Batang' },
        { code: 'LBR', name: 'Lembar' },
        // Volume
        { code: 'LTR', name: 'Liter' },
        { code: 'SAK', name: 'Sak' },
        { code: 'ROL', name: 'Roll' },
        // Time
        { code: 'HARI', name: 'Hari' },
        { code: 'JAM', name: 'Jam' },
        // Other
        { code: 'LS', name: 'Lumpsum' },
    ];

    const unitMap: Record<string, string> = {};
    for (const unit of units) {
        const created = await prisma.unit.upsert({
            where: { code: unit.code },
            update: { name: unit.name },
            create: { code: unit.code, name: unit.name },
        });
        unitMap[unit.code] = created.id;
    }
    console.log(`   ✅ ${units.length} units seeded\n`);

    // ==========================================
    // 2. SEED PLANS
    // ==========================================
    console.log('💳 Seeding Plans...');
    const plans = [
        { code: 'FREE', name: 'Free', priceCents: 0, maxProjects: 3 },
        { code: 'STARTER', name: 'Starter', priceCents: 9900000, maxProjects: 10 },
        { code: 'PRO', name: 'Professional', priceCents: 29900000, maxProjects: 50 },
        { code: 'ENTERPRISE', name: 'Enterprise', priceCents: 99900000, maxProjects: -1 },
    ];

    const planMap: Record<string, string> = {};
    for (const plan of plans) {
        const created = await prisma.plan.upsert({
            where: { code: plan.code },
            update: { name: plan.name, priceCents: plan.priceCents, maxProjects: plan.maxProjects },
            create: plan,
        });
        planMap[plan.code] = created.id;
    }
    console.log(`   ✅ ${plans.length} plans seeded\n`);

    // ==========================================
    // 3. SEED USERS (via Better Auth)
    // ==========================================
    console.log('👥 Seeding Users...');
    const { auth } = await import('./auth/auth.js');

    const usersToCreate = [
        { email: 'superadmin@planin.com', password: 'password123', name: 'Super Admin', role: 'superadmin' },
        { email: 'admin@planin.com', password: 'password123', name: 'Admin User', role: 'admin' },
        { email: 'user1@planin.com', password: 'password123', name: 'Budi Santoso', role: 'user' },
        { email: 'user2@planin.com', password: 'password123', name: 'Siti Rahayu', role: 'user' },
    ];

    const userMap: Record<string, string> = {};
    for (const userData of usersToCreate) {
        let user = await prisma.user.findFirst({ where: { email: userData.email } });

        if (!user) {
            const res = await auth.api.signUpEmail({
                body: { email: userData.email, password: userData.password, name: userData.name },
            });
            if (res?.user) {
                await prisma.user.update({
                    where: { id: res.user.id },
                    data: { role: userData.role },
                });
                userMap[userData.email] = res.user.id;
                console.log(`   ✅ Created ${userData.role}: ${userData.email}`);
            }
        } else {
            await prisma.user.update({ where: { id: user.id }, data: { role: userData.role } });
            userMap[userData.email] = user.id;
            console.log(`   ⏭️  Exists: ${userData.email}`);
        }
    }
    console.log('');

    // ==========================================
    // 4. SEED WORK DIVISION CATALOGS
    // ==========================================
    console.log('🏗️  Seeding Work Division Catalogs...');
    const divisions = [
        { code: 'PEKERJAAN_PERSIAPAN', name: 'Pekerjaan Persiapan', description: 'Persiapan lahan dan bangunan' },
        { code: 'PEKERJAAN_TANAH', name: 'Pekerjaan Tanah', description: 'Galian, urugan, dan pengolahan tanah' },
        { code: 'PEKERJAAN_PONDASI', name: 'Pekerjaan Pondasi', description: 'Konstruksi pondasi bangunan' },
        { code: 'PEKERJAAN_BETON', name: 'Pekerjaan Beton', description: 'Kolom, balok, plat lantai beton' },
        { code: 'PEKERJAAN_DINDING', name: 'Pekerjaan Dinding', description: 'Pasangan batu bata dan plesteran' },
        { code: 'PEKERJAAN_ATAP', name: 'Pekerjaan Atap', description: 'Rangka atap dan penutup atap' },
        { code: 'PEKERJAAN_LANTAI', name: 'Pekerjaan Lantai', description: 'Pemasangan lantai keramik/granit' },
        { code: 'PEKERJAAN_PINTU_JENDELA', name: 'Pekerjaan Pintu & Jendela', description: 'Kusen, daun pintu, jendela' },
        { code: 'PEKERJAAN_MEKANIKAL', name: 'Pekerjaan Mekanikal', description: 'Instalasi AC, pompa, lift' },
        { code: 'PEKERJAAN_ELEKTRIKAL', name: 'Pekerjaan Elektrikal', description: 'Instalasi listrik dan panel' },
        { code: 'PEKERJAAN_PLUMBING', name: 'Pekerjaan Plumbing', description: 'Pipa air bersih dan kotor' },
        { code: 'PEKERJAAN_FINISHING', name: 'Pekerjaan Finishing', description: 'Pengecatan dan finishing akhir' },
    ];

    const divisionMap: Record<string, string> = {};
    for (const div of divisions) {
        const created = await prisma.workDivisionCatalog.upsert({
            where: { code: div.code },
            update: { name: div.name, description: div.description },
            create: div,
        });
        divisionMap[div.code] = created.id;
    }
    console.log(`   ✅ ${divisions.length} work divisions seeded\n`);

    // ==========================================
    // 5. SEED TASK CATALOGS
    // ==========================================
    console.log('📋 Seeding Task Catalogs...');
    const tasks = [
        // Pekerjaan Persiapan
        { divisionCode: 'PEKERJAAN_PERSIAPAN', code: 'PP-001', name: 'Pembersihan Lokasi' },
        { divisionCode: 'PEKERJAAN_PERSIAPAN', code: 'PP-002', name: 'Pengukuran dan Pematokan' },
        { divisionCode: 'PEKERJAAN_PERSIAPAN', code: 'PP-003', name: 'Pembuatan Bouwplank' },
        { divisionCode: 'PEKERJAAN_PERSIAPAN', code: 'PP-004', name: 'Direksi Keet' },
        // Pekerjaan Tanah
        { divisionCode: 'PEKERJAAN_TANAH', code: 'PT-001', name: 'Galian Tanah Pondasi' },
        { divisionCode: 'PEKERJAAN_TANAH', code: 'PT-002', name: 'Urugan Pasir Bawah Pondasi' },
        { divisionCode: 'PEKERJAAN_TANAH', code: 'PT-003', name: 'Urugan Tanah Kembali' },
        // Pekerjaan Pondasi
        { divisionCode: 'PEKERJAAN_PONDASI', code: 'PF-001', name: 'Pondasi Batu Kali' },
        { divisionCode: 'PEKERJAAN_PONDASI', code: 'PF-002', name: 'Pondasi Footplat' },
        { divisionCode: 'PEKERJAAN_PONDASI', code: 'PF-003', name: 'Pondasi Tiang Pancang' },
        // Pekerjaan Beton
        { divisionCode: 'PEKERJAAN_BETON', code: 'PB-001', name: 'Sloof Beton 20x30' },
        { divisionCode: 'PEKERJAAN_BETON', code: 'PB-002', name: 'Kolom Beton 30x30' },
        { divisionCode: 'PEKERJAAN_BETON', code: 'PB-003', name: 'Balok Beton 25x40' },
        { divisionCode: 'PEKERJAAN_BETON', code: 'PB-004', name: 'Plat Lantai t=12cm' },
        // Pekerjaan Dinding
        { divisionCode: 'PEKERJAAN_DINDING', code: 'PD-001', name: 'Pasangan Bata 1/2 Batu' },
        { divisionCode: 'PEKERJAAN_DINDING', code: 'PD-002', name: 'Plesteran Dinding' },
        { divisionCode: 'PEKERJAAN_DINDING', code: 'PD-003', name: 'Acian Dinding' },
        // Pekerjaan Elektrikal
        { divisionCode: 'PEKERJAAN_ELEKTRIKAL', code: 'PE-001', name: 'Instalasi Titik Lampu' },
        { divisionCode: 'PEKERJAAN_ELEKTRIKAL', code: 'PE-002', name: 'Instalasi Stop Kontak' },
        { divisionCode: 'PEKERJAAN_ELEKTRIKAL', code: 'PE-003', name: 'Panel Listrik Utama' },
        // Pekerjaan Finishing
        { divisionCode: 'PEKERJAAN_FINISHING', code: 'PFN-001', name: 'Cat Dinding Interior' },
        { divisionCode: 'PEKERJAAN_FINISHING', code: 'PFN-002', name: 'Cat Dinding Eksterior' },
        { divisionCode: 'PEKERJAAN_FINISHING', code: 'PFN-003', name: 'Cat Plafon' },
    ];

    const taskMap: Record<string, string> = {};
    for (const task of tasks) {
        const divisionId = divisionMap[task.divisionCode];
        const existing = await prisma.taskCatalog.findFirst({
            where: { divisionId, code: task.code },
        });
        if (!existing) {
            const created = await prisma.taskCatalog.create({
                data: { divisionId, code: task.code, name: task.name },
            });
            taskMap[task.code] = created.id;
        } else {
            taskMap[task.code] = existing.id;
        }
    }
    console.log(`   ✅ ${tasks.length} task catalogs seeded\n`);

    // ==========================================
    // 6. SEED ITEM CATALOGS
    // ==========================================
    console.log('📦 Seeding Item Catalogs...');
    const items = [
        // Materials
        { type: ItemType.MATERIAL, code: 'SEMEN', name: 'Semen Portland 50kg', unitCode: 'SAK', price: 65000 },
        { type: ItemType.MATERIAL, code: 'PASIR', name: 'Pasir Cor', unitCode: 'M3', price: 350000 },
        { type: ItemType.MATERIAL, code: 'KERIKIL', name: 'Kerikil/Split', unitCode: 'M3', price: 450000 },
        { type: ItemType.MATERIAL, code: 'BATA_MERAH', name: 'Bata Merah', unitCode: 'BH', price: 900 },
        { type: ItemType.MATERIAL, code: 'BESI_10', name: 'Besi Beton D10', unitCode: 'BTG', price: 85000 },
        { type: ItemType.MATERIAL, code: 'BESI_12', name: 'Besi Beton D12', unitCode: 'BTG', price: 120000 },
        { type: ItemType.MATERIAL, code: 'KAWAT_BENDRAT', name: 'Kawat Bendrat', unitCode: 'KG', price: 22000 },
        { type: ItemType.MATERIAL, code: 'MULTIPLEX', name: 'Multiplex 12mm', unitCode: 'LBR', price: 185000 },
        { type: ItemType.MATERIAL, code: 'CAT_DINDING', name: 'Cat Dinding 5kg', unitCode: 'UNIT', price: 250000 },
        // Manpower
        { type: ItemType.MANPOWER, code: 'TUKANG_BATU', name: 'Tukang Batu', unitCode: 'HARI', price: 180000 },
        { type: ItemType.MANPOWER, code: 'TUKANG_KAYU', name: 'Tukang Kayu', unitCode: 'HARI', price: 180000 },
        { type: ItemType.MANPOWER, code: 'TUKANG_BESI', name: 'Tukang Besi', unitCode: 'HARI', price: 180000 },
        { type: ItemType.MANPOWER, code: 'TUKANG_CAT', name: 'Tukang Cat', unitCode: 'HARI', price: 150000 },
        { type: ItemType.MANPOWER, code: 'PEKERJA', name: 'Pekerja/Buruh', unitCode: 'HARI', price: 120000 },
        { type: ItemType.MANPOWER, code: 'MANDOR', name: 'Mandor', unitCode: 'HARI', price: 200000 },
        // Tools
        { type: ItemType.TOOL, code: 'MOLEN', name: 'Sewa Molen', unitCode: 'HARI', price: 300000 },
        { type: ItemType.TOOL, code: 'EXCAVATOR', name: 'Sewa Excavator', unitCode: 'JAM', price: 500000 },
        { type: ItemType.TOOL, code: 'VIBRATOR', name: 'Sewa Concrete Vibrator', unitCode: 'HARI', price: 150000 },
        { type: ItemType.TOOL, code: 'SCAFFOLDING', name: 'Sewa Scaffolding', unitCode: 'SET', price: 50000 },
    ];

    const itemMap: Record<string, string> = {};
    for (const item of items) {
        const created = await prisma.itemCatalog.upsert({
            where: { code: item.code },
            update: { name: item.name, defaultPrice: item.price },
            create: {
                type: item.type,
                code: item.code,
                name: item.name,
                unitId: unitMap[item.unitCode],
                defaultPrice: item.price,
            },
        });
        itemMap[item.code] = created.id;
    }
    console.log(`   ✅ ${items.length} item catalogs seeded\n`);

    // ==========================================
    // 7. SEED ORGANIZATIONS
    // ==========================================
    console.log('🏢 Seeding Organizations...');
    const user1Id = userMap['user1@planin.com'];

    let org = await prisma.organization.findFirst({ where: { code: 'PT_BANGUN_JAYA' } });
    if (!org) {
        org = await prisma.organization.create({
            data: {
                name: 'PT Bangun Jaya Konstruksi',
                code: 'PT_BANGUN_JAYA',
                ownerUserId: user1Id,
            },
        });
        console.log(`   ✅ Created organization: ${org.name}`);
    } else {
        console.log(`   ⏭️  Organization exists: ${org.name}`);
    }

    // Add user2 as member
    const user2Id = userMap['user2@planin.com'];
    const existingMember = await prisma.organizationMember.findFirst({
        where: { organizationId: org.id, userId: user2Id },
    });
    if (!existingMember && user2Id) {
        await prisma.organizationMember.create({
            data: { organizationId: org.id, userId: user2Id, role: 'MEMBER' },
        });
        console.log(`   ✅ Added user2 as organization member`);
    }
    console.log('');

    // ==========================================
    // 8. SEED SAMPLE PROJECT
    // ==========================================
    console.log('🏠 Seeding Sample Project...');
    let project = await prisma.project.findFirst({ where: { code: 'PRJ-RUMAH-001' } });
    if (!project) {
        project = await prisma.project.create({
            data: {
                organizationId: org.id,
                ownerUserId: user1Id,
                name: 'Pembangunan Rumah Tinggal 2 Lantai',
                code: 'PRJ-RUMAH-001',
                description: 'Proyek pembangunan rumah tinggal type 120/200 di Perumahan Green Hills',
                location: 'Perumahan Green Hills, Jakarta Selatan',
                taxRatePercent: 11.00,
                currency: 'IDR',
            },
        });
        console.log(`   ✅ Created project: ${project.name}`);

        // Add project divisions
        const projectDivisions = ['PEKERJAAN_PERSIAPAN', 'PEKERJAAN_TANAH', 'PEKERJAAN_PONDASI', 'PEKERJAAN_BETON', 'PEKERJAAN_DINDING'];
        for (let i = 0; i < projectDivisions.length; i++) {
            const divCode = projectDivisions[i];
            const div = await prisma.workDivisionCatalog.findUnique({ where: { code: divCode } });
            if (div) {
                await prisma.projectDivision.create({
                    data: {
                        projectId: project.id,
                        divisionId: div.id,
                        displayName: div.name,
                        sortOrder: i + 1,
                    },
                });
            }
        }
        console.log(`   ✅ Added ${projectDivisions.length} divisions to project`);

        // Add sample project tasks
        const projectDivison = await prisma.projectDivision.findFirst({
            where: { projectId: project.id },
            include: { division: true },
        });
        if (projectDivison) {
            const taskCatalog = await prisma.taskCatalog.findFirst({
                where: { divisionId: projectDivison.divisionId },
            });
            if (taskCatalog) {
                const projectTask = await prisma.projectTask.create({
                    data: {
                        projectId: project.id,
                        projectDivisionId: projectDivison.id,
                        taskCatalogId: taskCatalog.id,
                        displayName: taskCatalog.name,
                        sortOrder: 1,
                    },
                });
                console.log(`   ✅ Added sample task: ${taskCatalog.name}`);

                // Add sample line items
                const semen = await prisma.itemCatalog.findUnique({ where: { code: 'SEMEN' } });
                const tukang = await prisma.itemCatalog.findUnique({ where: { code: 'TUKANG_BATU' } });
                if (semen && tukang) {
                    await prisma.taskLineItem.createMany({
                        data: [
                            {
                                projectId: project.id,
                                projectTaskId: projectTask.id,
                                itemCatalogId: semen.id,
                                description: 'Semen untuk pekerjaan persiapan',
                                unitId: semen.unitId,
                                quantity: 10,
                                unitPrice: Number(semen.defaultPrice),
                                lineTotal: 10 * Number(semen.defaultPrice),
                            },
                            {
                                projectId: project.id,
                                projectTaskId: projectTask.id,
                                itemCatalogId: tukang.id,
                                description: 'Upah tukang untuk persiapan',
                                unitId: tukang.unitId,
                                quantity: 5,
                                unitPrice: Number(tukang.defaultPrice),
                                lineTotal: 5 * Number(tukang.defaultPrice),
                            },
                        ],
                    });
                    console.log(`   ✅ Added sample line items`);
                }
            }
        }
    } else {
        console.log(`   ⏭️  Project exists: ${project.name}`);
    }

    console.log('\n✨ Comprehensive seeding completed!\n');
    console.log('='.repeat(50));
    console.log('TEST ACCOUNTS:');
    console.log('='.repeat(50));
    console.log('Superadmin:  superadmin@planin.com / password123');
    console.log('Admin:       admin@planin.com / password123');
    console.log('User 1:      user1@planin.com / password123 (has org & project)');
    console.log('User 2:      user2@planin.com / password123 (org member)');
    console.log('='.repeat(50));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
