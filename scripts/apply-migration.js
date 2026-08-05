/**
 * Standalone migration runner.
 * Run this ON the VPS/server where MySQL is installed:
 *   node scripts/apply-migration.js
 *
 * Or run it from any machine that can reach the DB by setting env vars:
 *   DB_HOST=... DB_USER=... DB_PASSWORD=... DB_NAME=... node scripts/apply-migration.js
 */

const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");

// Load .env if present
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
    }
  }
} catch (_) {}

const config = {
  host:     process.env.DB_HOST     || "103.189.235.241",
  port:     parseInt(process.env.DB_PORT || "3306"),
  user:     process.env.DB_USER     || "synergy",
  password: process.env.DB_PASSWORD || "pkm2026",
  database: process.env.DB_NAME     || "synergy",
  multipleStatements: true,
  connectTimeout: 15000,
};

const MIGRATION_TABLE = `CREATE TABLE IF NOT EXISTS \`_prisma_migrations\` (
  \`id\`                    VARCHAR(36)   NOT NULL PRIMARY KEY,
  \`checksum\`              VARCHAR(64)   NOT NULL,
  \`finished_at\`           DATETIME(3)   NULL,
  \`migration_name\`        VARCHAR(255)  NOT NULL,
  \`logs\`                  TEXT          NULL,
  \`rolled_back_at\`        DATETIME(3)   NULL,
  \`started_at\`            DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`applied_steps_count\`   INT UNSIGNED  NOT NULL DEFAULT 0
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;

async function run() {
  console.log(`\nConnecting to ${config.host}:${config.port} / ${config.database} …`);
  const conn = await mysql.createConnection(config);
  console.log("Connected.\n");

  // Ensure Prisma migrations tracking table exists
  await conn.query(MIGRATION_TABLE);

  const migrationsDir = path.resolve(__dirname, "../prisma/migrations");
  const folders = fs
    .readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  let applied = 0;
  for (const folder of folders) {
    const sqlFile = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlFile)) continue;

    // Check if already applied
    const [rows] = await conn.query(
      "SELECT id FROM `_prisma_migrations` WHERE migration_name = ? AND finished_at IS NOT NULL",
      [folder]
    );
    if (rows.length > 0) {
      console.log(`  ✓ ${folder} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(sqlFile, "utf8");
    const id = crypto.randomUUID ? crypto.randomUUID() : require("crypto").randomUUID();
    const started = new Date();

    try {
      await conn.query(
        "INSERT INTO `_prisma_migrations` (id, checksum, migration_name, started_at) VALUES (?, ?, ?, ?)",
        [id, "manual", folder, started]
      );
      console.log(`  ▶ Applying ${folder} …`);
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
          await conn.query(statement);
        } catch (stmtErr) {
          // Ignore ER_DUP_FIELDNAME (1060), ER_TABLE_EXISTS_ERROR (1050), ER_DUP_KEYNAME (1061)
          if ([1060, 1050, 1061, 1091].includes(stmtErr.errno)) {
            console.log(`    ℹ Skipping statement due to existing schema object (${stmtErr.code})`);
          } else {
            throw stmtErr;
          }
        }
      }

      await conn.query(
        "UPDATE `_prisma_migrations` SET finished_at = ?, applied_steps_count = 1 WHERE id = ?",
        [new Date(), id]
      );
      console.log(`  ✓ ${folder} applied.`);
      applied++;
    } catch (err) {
      await conn.query(
        "UPDATE `_prisma_migrations` SET logs = ?, rolled_back_at = ? WHERE id = ?",
        [err.message, new Date(), id]
      );
      console.error(`  ✗ ${folder} FAILED:`, err.message);
      await conn.end();
      process.exit(1);
    }
  }

  await conn.end();
  if (applied === 0) {
    console.log("\nAll migrations already applied. Nothing to do.");
  } else {
    console.log(`\n${applied} migration(s) applied successfully.`);
  }
}

run().catch((err) => {
  console.error("\nFATAL:", err.message);
  process.exit(1);
});
