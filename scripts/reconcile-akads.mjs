// Reconcile akad state between the Postgres DB and the Hyperledger Fabric ledger.
//
// The ledger is the source of truth. Drift happens when the on-chain deploy that
// runs *after* the DB transaction in POST /api/investor/investments fails (e.g.
// the gateway is briefly unreachable -> "fetch failed"): the akad row commits but
// never reaches the chain, and later signing fails with a scary "can't connect"
// error. This heals both directions:
//
//   1. On-chain but DB stale  -> copy ledger state into the akad row (safe, DB-only).
//   2. In DB but not on-chain -> re-run the deploy (investment -> akad -> link ->
//      investor-sign) against the gateway, then sync the row (writes to the ledger).
//
// Usage:
//   node scripts/reconcile-akads.mjs            # dry-run, prints the plan only
//   node scripts/reconcile-akads.mjs --apply-db # apply direction (1) only
//   node scripts/reconcile-akads.mjs --apply-chain  # apply (1) AND (2) [ledger writes]

import "dotenv/config";
import pg from "pg";

const APPLY_DB = process.argv.includes("--apply-db") || process.argv.includes("--apply-chain");
const APPLY_CHAIN = process.argv.includes("--apply-chain");
const MODE = APPLY_CHAIN ? "APPLY-CHAIN" : APPLY_DB ? "APPLY-DB" : "DRY-RUN";

const RAW = process.env.BLOCKCHAIN_API_URL;
if (!RAW) { console.error("BLOCKCHAIN_API_URL not set"); process.exit(1); }
const isLoopback = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(RAW);
const BASE = (isLoopback ? RAW : RAW.replace(/^http:\/\//i, "https://")).replace(/\/+$/, "") + "/api/v1";
const TIMEOUT_MS = 15000;

async function call(path, method, body) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(BASE + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) return { ok: false, error: `${method} ${path} -> ${res.status}: ${text.slice(0, 200)}` };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  } finally { clearTimeout(t); }
}

const getAkadOnChain = (id) => call(`/akad/${id}`, "GET");
const toDate = (v) => (v && v !== "" ? new Date(v) : null);

async function syncDbFromChain(pool, akadId, chain) {
  const isActive = chain.status === "ACTIVE";
  await pool.query(
    `UPDATE akads SET status=$2, "umkmSignedAt"=$3, "investorSignedAt"=$4, "approvedAt"=$5,
       "approvedBy"=$6, "deployedAt"=$7, "blockchainStatus"=$8, "updatedAt"=NOW() WHERE id=$1`,
    [akadId, isActive ? "ACTIVE" : chain.status, toDate(chain.umkmSignedAt), toDate(chain.investorSignedAt),
     toDate(chain.approvedAt), chain.approvedBy || null, toDate(chain.deployedAt),
     isActive ? "CONFIRMED" : "SUBMITTED"]
  );
}

async function deployToChain(a) {
  const investmentDeploy = await call("/investment", "POST", {
    id: a.investmentId, investorId: a.investorProfileId, campaignId: a.campaignId,
    umkmId: a.umkmProfileId, amount: Number(a.principalAmount), akadType: a.akadType,
  });
  if (!investmentDeploy.ok) return { ok: false, step: "investment", error: investmentDeploy.error };

  const akadDeploy = await call("/akad", "POST", {
    id: a.id, campaignId: a.campaignId, investmentId: a.investmentId, investorId: a.investorProfileId,
    umkmId: a.umkmProfileId, akadType: a.akadType, principalAmount: Number(a.principalAmount),
    nisbahInvestor: a.nisbahInvestor, nisbahUmkm: a.nisbahUmkm, platformFeeRate: a.platformFeeRate,
    durationMonths: a.durationMonths, startDate: new Date(a.startDate).toISOString(),
    endDate: new Date(a.endDate).toISOString(),
  });
  if (!akadDeploy.ok) return { ok: false, step: "akad", error: akadDeploy.error };

  await call(`/investment/${a.investmentId}/link-akad`, "POST", { akadId: a.id });
  const sign = await call(`/akad/${a.id}/sign`, "POST", { signer: "investor", signerId: a.investorProfileId });
  if (!sign.ok) return { ok: false, step: "investor-sign", error: sign.error };
  return { ok: true };
}

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(`
    SELECT a.id, a.status, a."blockchainStatus", a."umkmSignedAt", a."investorSignedAt", a."approvedAt",
           a."campaignId", a."investmentId", a."akadType", a."principalAmount", a."nisbahInvestor",
           a."nisbahUmkm", a."platformFeeRate", a."durationMonths", a."startDate", a."endDate",
           i."investorProfileId", c."umkmProfileId"
    FROM akads a
    LEFT JOIN investments i ON i.id = a."investmentId"
    LEFT JOIN campaigns c ON c.id = a."campaignId"
    ORDER BY a."createdAt"`);

  console.log(`\n=== reconcile-akads  [${MODE}]  gateway=${BASE} ===`);
  console.log(`Total akads: ${rows.length}\n`);

  const stats = { inSync: 0, dbSynced: 0, dbToSync: 0, deployed: 0, toDeploy: 0, skipped: 0, failed: 0 };

  for (const a of rows) {
    const chain = await getAkadOnChain(a.id);
    if (chain.ok) {
      const c = chain.data;
      const drift = a.status !== c.status || !!a.umkmSignedAt !== !!(c.umkmSignedAt && c.umkmSignedAt !== "");
      if (!drift) { stats.inSync++; continue; }
      console.log(`[DB-STALE ] ${a.id}  DB(${a.status}, umkmSigned=${!!a.umkmSignedAt}) -> chain(${c.status}, umkmSigned=${!!c.umkmSignedAt})`);
      if (APPLY_DB) { await syncDbFromChain(pool, a.id, c); stats.dbSynced++; console.log(`            -> DB synced from ledger`); }
      else stats.dbToSync++;
    } else {
      // Not on chain. Backfill needs a linked investment + resolvable parties + dates,
      // AND the DB row must still be PENDING. Backfilling an akad the DB already marks
      // ACTIVE/COMPLETED/etc would create a fresh investor-only PENDING akad on-chain and
      // then downgrade the DB row -> corruption. Those are inconsistent seed rows; flag them.
      const hasParts = a.investmentId && a.investorProfileId && a.umkmProfileId && a.startDate && a.endDate;
      const canDeploy = hasParts && a.status === "PENDING";
      console.log(`[OFF-CHAIN] ${a.id}  DB(${a.status}, bcStatus=${a.blockchainStatus})  deployable=${!!canDeploy}`);
      if (!hasParts) { stats.skipped++; console.log(`            -> SKIP (missing investment/parties/dates)`); continue; }
      if (a.status !== "PENDING") { stats.skipped++; console.log(`            -> SKIP (DB status=${a.status} but never on ledger — inconsistent seed row, needs manual review)`); continue; }
      if (APPLY_CHAIN) {
        const d = await deployToChain(a);
        if (!d.ok) { stats.failed++; console.log(`            -> DEPLOY FAILED at ${d.step}: ${d.error}`); continue; }
        const back = await getAkadOnChain(a.id);
        if (back.ok) await syncDbFromChain(pool, a.id, back.data);
        stats.deployed++;
        console.log(`            -> deployed to ledger + DB synced (investor-signed, PENDING umkm+admin)`);
      } else stats.toDeploy++;
    }
  }

  console.log(`\n=== summary [${MODE}] ===`);
  console.log(JSON.stringify(stats, null, 2));
  if (!APPLY_DB) console.log(`\nDry-run only. Re-run with --apply-db (DB syncs) or --apply-chain (DB syncs + ledger backfill).`);
  await pool.end();
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
