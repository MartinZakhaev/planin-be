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
    // 3. SEED ROLES & PERMISSIONS (RBAC)
    // ==========================================
    console.log('🔐 Seeding Roles & Permissions...');

    // Define all permissions based on the statement in permissions.ts
    const permissionsData = [
        // User permissions
        { resource: 'user', action: 'create', description: 'Create new users' },
        { resource: 'user', action: 'read', description: 'View user information' },
        { resource: 'user', action: 'update', description: 'Update user information' },
        { resource: 'user', action: 'delete', description: 'Delete users' },
        // Project permissions
        { resource: 'project', action: 'create', description: 'Create new projects' },
        { resource: 'project', action: 'read', description: 'View projects' },
        { resource: 'project', action: 'update', description: 'Edit projects' },
        { resource: 'project', action: 'delete', description: 'Delete projects' },
        { resource: 'project', action: 'share', description: 'Share projects with others' },
        // Organization permissions
        { resource: 'organization', action: 'create', description: 'Create organizations' },
        { resource: 'organization', action: 'read', description: 'View organizations' },
        { resource: 'organization', action: 'update', description: 'Update organizations' },
        { resource: 'organization', action: 'delete', description: 'Delete organizations' },
        { resource: 'organization', action: 'manage-members', description: 'Manage organization members' },
        // Catalog permissions
        { resource: 'unit', action: 'create', description: 'Create units' },
        { resource: 'unit', action: 'read', description: 'View units' },
        { resource: 'unit', action: 'update', description: 'Update units' },
        { resource: 'unit', action: 'delete', description: 'Delete units' },
        { resource: 'work_division', action: 'create', description: 'Create work divisions' },
        { resource: 'work_division', action: 'read', description: 'View work divisions' },
        { resource: 'work_division', action: 'update', description: 'Update work divisions' },
        { resource: 'work_division', action: 'delete', description: 'Delete work divisions' },
        { resource: 'task_catalog', action: 'create', description: 'Create task catalogs' },
        { resource: 'task_catalog', action: 'read', description: 'View task catalogs' },
        { resource: 'task_catalog', action: 'update', description: 'Update task catalogs' },
        { resource: 'task_catalog', action: 'delete', description: 'Delete task catalogs' },
        { resource: 'item_catalog', action: 'create', description: 'Create item catalogs' },
        { resource: 'item_catalog', action: 'read', description: 'View item catalogs' },
        { resource: 'item_catalog', action: 'update', description: 'Update item catalogs' },
        { resource: 'item_catalog', action: 'delete', description: 'Delete item catalogs' },
        // System permissions
        { resource: 'audit_log', action: 'create', description: 'Create audit logs' },
        { resource: 'audit_log', action: 'read', description: 'View audit logs' },
        { resource: 'audit_log', action: 'update', description: 'Update audit logs' },
        { resource: 'audit_log', action: 'delete', description: 'Delete audit logs' },
        { resource: 'subscription', action: 'create', description: 'Create subscriptions' },
        { resource: 'subscription', action: 'read', description: 'View subscriptions' },
        { resource: 'subscription', action: 'update', description: 'Update subscriptions' },
        { resource: 'subscription', action: 'delete', description: 'Delete subscriptions' },
        { resource: 'plan', action: 'create', description: 'Create plans' },
        { resource: 'plan', action: 'read', description: 'View plans' },
        { resource: 'plan', action: 'update', description: 'Update plans' },
        { resource: 'plan', action: 'delete', description: 'Delete plans' },
    ];

    // Create all permissions
    const permissionMap: Record<string, string> = {};
    for (const perm of permissionsData) {
        const key = `${perm.resource}:${perm.action}`;
        const created = await prisma.permission.upsert({
            where: { resource_action: { resource: perm.resource, action: perm.action } },
            update: { description: perm.description },
            create: perm,
        });
        permissionMap[key] = created.id;
    }
    console.log(`   ✅ ${permissionsData.length} permissions seeded`);

    // Define roles with their permissions
    const rolesData = [
        {
            name: 'superadmin',
            displayName: 'Super Administrator',
            description: 'Full system access with all permissions',
            isSystem: true,
            permissions: Object.keys(permissionMap), // All permissions
        },
        {
            name: 'admin',
            displayName: 'Administrator',
            description: 'Administrative access for managing users and content',
            isSystem: true,
            permissions: [
                'user:create', 'user:read', 'user:update', 'user:delete',
                'project:create', 'project:read', 'project:update', 'project:delete', 'project:share',
                'organization:read', 'organization:update', 'organization:manage-members',
                'unit:create', 'unit:read', 'unit:update', 'unit:delete',
                'work_division:create', 'work_division:read', 'work_division:update', 'work_division:delete',
                'task_catalog:create', 'task_catalog:read', 'task_catalog:update', 'task_catalog:delete',
                'item_catalog:create', 'item_catalog:read', 'item_catalog:update', 'item_catalog:delete',
                'audit_log:read',
                'subscription:read', 'subscription:update',
                'plan:read',
            ],
        },
        {
            name: 'staff',
            displayName: 'Staff',
            description: 'Staff access for managing projects',
            isSystem: true,
            permissions: [
                'project:create', 'project:read', 'project:update',
                'organization:read',
                'unit:read',
                'work_division:read',
                'task_catalog:read',
                'item_catalog:read',
                'plan:read',
            ],
        },
        {
            name: 'user',
            displayName: 'User',
            description: 'Standard user access',
            isSystem: true,
            permissions: [
                'project:create', 'project:read', 'project:update', 'project:delete',
                'organization:read',
                'unit:read',
                'work_division:read',
                'task_catalog:read',
                'item_catalog:read',
                'plan:read',
            ],
        },
    ];

    const roleMap: Record<string, string> = {};
    for (const roleData of rolesData) {
        const { permissions: permKeys, ...roleFields } = roleData;

        // Create or update role
        let role = await prisma.role.findUnique({ where: { name: roleFields.name } });
        if (!role) {
            role = await prisma.role.create({ data: roleFields });
            console.log(`   ✅ Created role: ${role.displayName}`);
        } else {
            role = await prisma.role.update({
                where: { name: roleFields.name },
                data: { displayName: roleFields.displayName, description: roleFields.description },
            });
            console.log(`   ⏭️  Role exists: ${role.displayName}`);
        }
        roleMap[roleFields.name] = role.id;

        // Assign permissions to role
        for (const permKey of permKeys) {
            const permId = permissionMap[permKey];
            if (permId) {
                await prisma.rolePermission.upsert({
                    where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
                    update: {},
                    create: { roleId: role.id, permissionId: permId },
                });
            }
        }
    }
    console.log(`   ✅ ${rolesData.length} roles seeded with permissions\n`);

    // ==========================================
    // 4. SEED USERS (via Prisma - bypass Better Auth to avoid role field mismatch)
    // ==========================================
    console.log('👥 Seeding Users...');
    const { hashPassword } = await import('better-auth/crypto');

    const usersToCreate = [
        { email: 'superadmin@planin.com', password: 'password123', name: 'Super Admin', roleName: 'superadmin' },
        { email: 'admin@planin.com', password: 'password123', name: 'Admin User', roleName: 'admin' },
        { email: 'user1@planin.com', password: 'password123', name: 'Budi Santoso', roleName: 'user' },
        { email: 'user2@planin.com', password: 'password123', name: 'Siti Rahayu', roleName: 'user' },
    ];

    const userMap: Record<string, string> = {};
    for (const userData of usersToCreate) {
        let user = await prisma.user.findFirst({ where: { email: userData.email } });
        const roleId = roleMap[userData.roleName];
        const hashedPassword = await hashPassword(userData.password);

        if (!user) {
            const { randomBytes } = await import('crypto');
            const id = randomBytes(16).toString('hex');
            user = await prisma.user.create({
                data: {
                    id,
                    email: userData.email,
                    fullName: userData.name,
                    roleId,
                    banned: false,
                },
            });
            // Create the account with hashed password for better-auth
            await prisma.account.create({
                data: {
                    id: randomBytes(16).toString('hex'),
                    userId: user.id,
                    accountId: user.id,
                    providerId: 'credential',
                    password: hashedPassword,
                },
            });
            userMap[userData.email] = user.id;
            console.log(`   ✅ Created ${userData.roleName}: ${userData.email}`);
        } else {
            await prisma.user.update({ where: { id: user.id }, data: { roleId } });
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
