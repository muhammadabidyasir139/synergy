const { PrismaClient } = require('./src/generated/prisma');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const { SignJWT } = require('jose');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET ?? "synergy-dev-secret-change-in-production");

async function main() {
  const passwordHash = await bcrypt.hash('TestPassword123!', 12);
  const phoneNumber = '0812' + Date.now().toString().slice(-8);

  const user = await db.user.create({
    data: {
      email: `crud.test.${Date.now()}@example.invalid`,
      phoneNumber,
      passwordHash,
      role: 'UMKM',
      status: 'ACTIVE',
      wallet: { create: {} },
    },
  });

  const profile = await db.umkmProfile.create({
    data: {
      userId: user.id,
      ownerName: 'CRUD Test Owner',
      businessName: 'CRUD_TEST_AUTOMATION',
      businessCategory: 'Testing',
      businessDescription: 'Automated CRUD test profile - safe to delete',
      city: 'Jakarta',
      province: 'DKI Jakarta',
    },
  });

  const token = await new SignJWT({ userId: user.id, role: 'UMKM' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);

  const out = { userId: user.id, umkmProfileId: profile.id, sessionToken: token };
  fs.writeFileSync('_test_state.json', JSON.stringify(out, null, 2));
  console.log('SETUP_OK', JSON.stringify(out));

  await db.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error('SETUP_FAIL', e); process.exit(1); });
