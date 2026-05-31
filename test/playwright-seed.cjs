require("dotenv/config");

const { createHash, randomUUID } = require("crypto");
const { Pool } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;
const OTP_SECRET =
  process.env.OTP_SECRET ||
  process.env.BETTER_AUTH_SECRET ||
  process.env.SESSION_SECRET ||
  "planin-local-otp-secret";

const ADMIN_EMAIL = "pw_e2e_admin@example.com";
const VERIFY_EMAIL = "pw_e2e_verify@example.com";
const PASSWORD = "Password123!";
const VERIFY_OTP = "123456";

const permissions = [
  ["user", "create"],
  ["user", "read"],
  ["user", "update"],
  ["user", "delete"],
  ["organization", "create"],
  ["organization", "read"],
  ["organization", "update"],
  ["organization", "delete"],
  ["organization", "manage-members"],
  ["unit", "create"],
  ["unit", "read"],
  ["unit", "update"],
  ["unit", "delete"],
  ["work_division", "create"],
  ["work_division", "read"],
  ["work_division", "update"],
  ["work_division", "delete"],
  ["task_catalog", "create"],
  ["task_catalog", "read"],
  ["task_catalog", "update"],
  ["task_catalog", "delete"],
  ["item_catalog", "create"],
  ["item_catalog", "read"],
  ["item_catalog", "update"],
  ["item_catalog", "delete"],
  ["audit_log", "read"],
  ["subscription", "create"],
  ["subscription", "read"],
  ["subscription", "update"],
  ["subscription", "delete"],
  ["plan", "create"],
  ["plan", "read"],
  ["plan", "update"],
  ["plan", "delete"],
];

function otpHash(email, otp) {
  return createHash("sha256").update(`${email}:${otp}:${OTP_SECRET}`).digest("hex");
}

async function seed() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required for real Playwright e2e seeding.");
  }

  const { hashPassword } = await import("better-auth/crypto");
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await cleanup(client);

    const permissionIds = [];
    for (const [resource, action] of permissions) {
      const result = await client.query(
        `
          INSERT INTO permissions (resource, action, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (resource, action)
          DO UPDATE SET description = EXCLUDED.description
          RETURNING id
        `,
        [resource, action, `${action} ${resource}`],
      );
      permissionIds.push(result.rows[0].id);
    }

    const adminRole = await client.query(
      `
        INSERT INTO roles (name, display_name, description, is_system)
        VALUES ('admin', 'Administrator', 'Administrative access for e2e tests', true)
        ON CONFLICT (name)
        DO UPDATE SET display_name = EXCLUDED.display_name
        RETURNING id
      `,
    );
    const adminRoleId = adminRole.rows[0].id;

    for (const permissionId of permissionIds) {
      await client.query(
        `
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES ($1, $2)
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `,
        [adminRoleId, permissionId],
      );
    }

    await upsertCredentialUser(client, {
      id: "pw_e2e_admin_user",
      email: ADMIN_EMAIL,
      fullName: "Playwright Admin",
      password: PASSWORD,
      emailVerified: true,
      roleId: adminRoleId,
      hashPassword,
    });

    await upsertCredentialUser(client, {
      id: "pw_e2e_verify_user",
      email: VERIFY_EMAIL,
      fullName: "Playwright Verify",
      password: PASSWORD,
      emailVerified: false,
      roleId: adminRoleId,
      hashPassword,
    });

    await client.query(
      `
        INSERT INTO verifications (id, identifier, value, expires_at, created_at, updated_at)
        VALUES ($1, $2, $3, now() + interval '10 minutes', now(), now())
      `,
      [
        "pw_e2e_verify_otp",
        `email-verification-otp:${VERIFY_EMAIL}`,
        JSON.stringify({ hash: otpHash(VERIFY_EMAIL, VERIFY_OTP), attempts: 0 }),
      ],
    );

    const unit = await client.query(
      `
        INSERT INTO units (code, name)
        VALUES ('PW_E2E_BASE_UNIT', 'Playwright Base Unit')
        ON CONFLICT (code)
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `,
    );

    const division = await client.query(
      `
        INSERT INTO work_division_catalog (code, name, description)
        VALUES ('PW_E2E_BASE_DIV', 'Playwright Base Division', 'Base division for real e2e')
        ON CONFLICT (code)
        DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
        RETURNING id
      `,
    );

    await client.query(
      `
        INSERT INTO task_catalog (division_id, code, name, description)
        VALUES ($1, 'PW_E2E_BASE_TASK', 'Playwright Base Task', 'Base task for real e2e')
        ON CONFLICT (division_id, code)
        DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
      `,
      [division.rows[0].id],
    );

    await client.query(
      `
        INSERT INTO item_catalog (type, code, name, unit_id, default_price, description)
        VALUES ('MATERIAL', 'PW_E2E_BASE_ITEM', 'Playwright Base Item', $1, 1000, 'Base item for real e2e')
        ON CONFLICT (code)
        DO UPDATE SET name = EXCLUDED.name, unit_id = EXCLUDED.unit_id, default_price = EXCLUDED.default_price
      `,
      [unit.rows[0].id],
    );

    await client.query("COMMIT");
    console.log("Playwright real e2e seed complete.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function upsertCredentialUser(client, user) {
  const password = await user.hashPassword(user.password);

  await client.query(
    `
      INSERT INTO users (id, email, full_name, email_verified, role_id, banned)
      VALUES ($1, $2, $3, $4, $5, false)
      ON CONFLICT (email)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email_verified = EXCLUDED.email_verified,
        role_id = EXCLUDED.role_id,
        banned = false,
        ban_reason = null,
        ban_expires = null
      RETURNING id
    `,
    [user.id, user.email, user.fullName, user.emailVerified, user.roleId],
  );

  await client.query("DELETE FROM accounts WHERE user_id = $1", [user.id]);
  await client.query(
    `
      INSERT INTO accounts (id, user_id, account_id, provider_id, password)
      VALUES ($1, $2, $3, 'credential', $4)
    `,
    [`${user.id}_account`, user.id, user.id, password],
  );
}

async function cleanup(client) {
  const prefixedUsers = await client.query(
    "SELECT id FROM users WHERE email LIKE 'pw_e2e_%@example.com'",
  );
  const userIds = prefixedUsers.rows.map((row) => row.id);

  await client.query("DELETE FROM verifications WHERE identifier LIKE 'email-verification-otp:pw_e2e_%@example.com'");

  if (userIds.length) {
    await client.query("DELETE FROM audit_logs WHERE user_id = ANY($1::varchar[])", [userIds]);
    await client.query("DELETE FROM subscriptions WHERE user_id = ANY($1::varchar[])", [userIds]);
    await client.query("DELETE FROM organization_members WHERE user_id = ANY($1::varchar[])", [userIds]);
    await client.query("DELETE FROM organizations WHERE owner_user_id = ANY($1::varchar[])", [userIds]);
    await client.query("DELETE FROM sessions WHERE user_id = ANY($1::varchar[])", [userIds]);
    await client.query("DELETE FROM accounts WHERE user_id = ANY($1::varchar[])", [userIds]);
    await client.query("DELETE FROM users WHERE id = ANY($1::varchar[])", [userIds]);
  }

  await client.query("DELETE FROM subscriptions WHERE plan_id IN (SELECT id FROM plans WHERE code LIKE 'PW_E2E_%')");
  await client.query("DELETE FROM plans WHERE code LIKE 'PW_E2E_%'");
  await client.query("DELETE FROM item_catalog WHERE code LIKE 'PW_E2E_%'");
  await client.query("DELETE FROM task_catalog WHERE code LIKE 'PW_E2E_%'");
  await client.query("DELETE FROM work_division_catalog WHERE code LIKE 'PW_E2E_%'");
  await client.query("DELETE FROM units WHERE code LIKE 'PW_E2E_%'");
  await client.query("DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles WHERE name LIKE 'pw_e2e_%')");
  await client.query("DELETE FROM roles WHERE name LIKE 'pw_e2e_%'");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
