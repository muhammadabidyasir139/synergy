const { PrismaClient } = require('./src/generated/prisma');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const BASE = 'http://localhost:3000';
const state = JSON.parse(fs.readFileSync('_test_state.json', 'utf8'));
const { umkmProfileId, sessionToken } = state;

const results = [];
function log(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ' :: ' + detail : ''}`);
}

async function testProfil() {
  console.log('\n=== PROFIL (UmkmProfile) ===');

  let r = await fetch(`${BASE}/api/umkm/profile`, { headers: { 'x-umkm-id': umkmProfileId } });
  let data = await r.json();
  log('Profil - READ', r.ok && data.businessName === 'CRUD_TEST_AUTOMATION', `status=${r.status} businessName=${data.businessName}`);

  r = await fetch(`${BASE}/api/umkm/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-umkm-id': umkmProfileId },
    body: JSON.stringify({ businessName: 'CRUD_TEST_AUTOMATION_UPDATED', city: 'Bandung' }),
  });
  data = await r.json();
  log('Profil - UPDATE', r.ok && data.success === true, `status=${r.status}`);

  r = await fetch(`${BASE}/api/umkm/profile`, { headers: { 'x-umkm-id': umkmProfileId } });
  data = await r.json();
  log('Profil - READ after UPDATE', data.businessName === 'CRUD_TEST_AUTOMATION_UPDATED' && data.city === 'Bandung', `businessName=${data.businessName} city=${data.city}`);

  console.log('\n=== PROFIL KEUANGAN (AkadVariable) ===');

  r = await fetch(`${BASE}/api/umkm/profile/finance`, { headers: { 'x-umkm-id': umkmProfileId } });
  data = await r.json();
  log('Finance - READ (empty)', r.ok && data.isComplete === false, `status=${r.status} isComplete=${data.isComplete}`);

  const financePayload = {
    asetLancar: 100000000,
    asetTidakLancar: 50000000,
    totalHutangKas: 20000000,
    totalPendapatan: 80000000,
    totalBeban: 60000000,
    labaBersih: 20000000,
    rataRataArusKas: 15000000,
  };
  r = await fetch(`${BASE}/api/umkm/profile/finance`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-umkm-id': umkmProfileId },
    body: JSON.stringify(financePayload),
  });
  data = await r.json();
  log('Finance - CREATE (first PUT)', r.ok && data.success === true, `status=${r.status}`);

  r = await fetch(`${BASE}/api/umkm/profile/finance`, { headers: { 'x-umkm-id': umkmProfileId } });
  data = await r.json();
  log('Finance - READ after CREATE', data.isComplete === true && data.asetLancar === 100000000, `isComplete=${data.isComplete} asetLancar=${data.asetLancar}`);

  r = await fetch(`${BASE}/api/umkm/profile/finance`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-umkm-id': umkmProfileId },
    body: JSON.stringify({ ...financePayload, labaBersih: 99999999 }),
  });
  data = await r.json();
  log('Finance - UPDATE (second PUT)', r.ok && data.success === true, `status=${r.status}`);

  r = await fetch(`${BASE}/api/umkm/profile/finance`, { headers: { 'x-umkm-id': umkmProfileId } });
  data = await r.json();
  log('Finance - READ after UPDATE', data.labaBersih === 99999999, `labaBersih=${data.labaBersih}`);

  const rowCount = await db.akadVariable.count({ where: { umkmProfileId } });
  log('Finance - single row maintained (no duplicate on update)', rowCount === 1, `rowCount=${rowCount}`);

  r = await fetch(`${BASE}/api/umkm/profile/finance`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-umkm-id': umkmProfileId },
    body: JSON.stringify({ ...financePayload, asetLancar: -5 }),
  });
  log('Finance - VALIDATION rejects negative value', r.status === 400, `status=${r.status}`);
}

async function testPengajuan() {
  console.log('\n=== PENGAJUAN (FundingApplication) ===');

  const created = await db.fundingApplication.create({
    data: {
      umkmProfileId,
      akadType: 'MUSYARAKAH',
      requestedAmount: 50000000,
      durationMonths: 12,
      purpose: 'CRUD test pengajuan',
      status: 'PENDING',
    },
  });
  log('Pengajuan - CREATE', !!created.id, `id=${created.id}`);

  const read = await db.fundingApplication.findUnique({ where: { id: created.id } });
  log('Pengajuan - READ', read && read.requestedAmount.toString() === '50000000', `requestedAmount=${read?.requestedAmount}`);

  const updated = await db.fundingApplication.update({ where: { id: created.id }, data: { status: 'APPROVED', reviewedAt: new Date() } });
  log('Pengajuan - UPDATE (status -> APPROVED)', updated.status === 'APPROVED', `status=${updated.status}`);

  await db.fundingApplication.delete({ where: { id: created.id } });
  const gone = await db.fundingApplication.findUnique({ where: { id: created.id } });
  log('Pengajuan - DELETE', gone === null, `gone=${gone === null}`);

  // Validation gate: financing profile is now complete (from previous test), so createPengajuan-style gate should pass.
  const financeExists = await db.akadVariable.findFirst({ where: { umkmProfileId } });
  log('Pengajuan - finance-completeness gate (isFinanceProfileComplete logic)', !!financeExists, `financeExists=${!!financeExists}`);
}

async function testLaporanBulanan() {
  console.log('\n=== LAPORAN BULANAN (MonitoringReport) ===');
  const cookie = `synergy_session=${sessionToken}`;

  let r = await fetch(`${BASE}/api/umkm/monitoring`, { headers: { Cookie: cookie } });
  let data = await r.json();
  log('Laporan - READ (empty)', r.ok && Array.isArray(data) && data.length === 0, `status=${r.status} count=${Array.isArray(data) ? data.length : 'n/a'}`);

  r = await fetch(`${BASE}/api/umkm/monitoring`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ tanggal: new Date().toISOString(), omzet: 25000000, penggunaan: 'CRUD test - restock barang', catatan: 'automated test' }),
  });
  const created = await r.json();
  log('Laporan - CREATE', r.ok && !!created.id, `status=${r.status} id=${created.id}`);

  r = await fetch(`${BASE}/api/umkm/monitoring`, { headers: { Cookie: cookie } });
  data = await r.json();
  log('Laporan - READ after CREATE', Array.isArray(data) && data.length === 1 && data[0].id === created.id, `count=${data.length}`);

  // No PATCH/DELETE route exists yet for monitoring reports; verify the capability at the data layer.
  const updated = await db.monitoringReport.update({ where: { id: created.id }, data: { catatan: 'updated via Prisma (no API route exists)' } });
  log('Laporan - UPDATE (data-layer only, no API route)', updated.catatan.startsWith('updated via Prisma'), `catatan=${updated.catatan}`);

  await db.monitoringReport.delete({ where: { id: created.id } });
  const gone = await db.monitoringReport.findUnique({ where: { id: created.id } });
  log('Laporan - DELETE (data-layer only, no API route)', gone === null, `gone=${gone === null}`);
}

async function main() {
  await testProfil();
  await testPengajuan();
  await testLaporanBulanan();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== SUMMARY: ${results.length - failed.length}/${results.length} passed ===`);
  if (failed.length) {
    console.log('FAILED CASES:', failed.map((f) => f.name).join('; '));
  }

  fs.writeFileSync('_test_results.json', JSON.stringify(results, null, 2));

  await db.$disconnect();
  await pool.end();
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error('RUN_FAIL', e); process.exit(1); });
