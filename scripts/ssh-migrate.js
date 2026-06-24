/**
 * Applies all Prisma migrations to the remote MySQL server via SSH.
 * Usage: node scripts/ssh-migrate.js
 */
const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");

const SSH = {
  host: "103.189.235.241",
  port: 22,
  username: "muhammadabid",
  password: "8MH7-j87icGf-c_",
};

const DB = {
  user: "synergy",
  password: "pkm2026",
  name: "synergy",
};

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    // Use login shell so PATH includes /usr/bin, /usr/local/bin etc.
    conn.exec(`bash -lc ${JSON.stringify(cmd)}`, (err, stream) => {
      if (err) return reject(err);
      let out = "", errOut = "";
      stream.on("data", (d) => (out += d));
      stream.stderr.on("data", (d) => (errOut += d));
      stream.on("close", (code) => {
        resolve({ code, out: out.trim(), err: errOut.trim() });
      });
    });
  });
}

async function execSQL(conn, mysqlBin, sql) {
  return new Promise((resolve, reject) => {
    const cmd = `bash -lc ${JSON.stringify(`${mysqlBin} -u${DB.user} -p'${DB.password}' ${DB.name}`)}`;
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = "", errOut = "";
      stream.on("data", (d) => (out += d));
      stream.stderr.on("data", (d) => (errOut += d));
      stream.stdin.write(sql);
      stream.stdin.end();
      stream.on("close", (code) => {
        const lower = errOut.toLowerCase();
        if (code !== 0 && !lower.includes("warning")) {
          reject(new Error(errOut || `exit ${code}`));
        } else {
          resolve(out.trim());
        }
      });
    });
  });
}

async function findMySQL(conn) {
  // Try login shell which first — most reliable
  const { code, out } = await exec(conn, "which mysql 2>/dev/null");
  if (code === 0 && out && !out.includes("bash-completion")) return out;

  // Explicit executable paths
  const candidates = [
    "/usr/bin/mysql",
    "/usr/local/bin/mysql",
    "/usr/local/mysql/bin/mysql",
    "/opt/mysql/bin/mysql",
  ];
  for (const bin of candidates) {
    const r = await exec(conn, `test -x ${bin} && ${bin} --version 2>/dev/null`);
    if (r.code === 0) return bin;
  }

  // Last resort: find executable files named mysql (not in bash-completion)
  const { out: found } = await exec(
    conn,
    "find /usr/bin /usr/local/bin /usr/lib/mysql -maxdepth 2 -name mysql -type f -executable 2>/dev/null | head -1"
  );
  return found || null;
}

async function main() {
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on("ready", resolve).on("error", reject).connect(SSH);
  });
  console.log("SSH connected to", SSH.host);

  // Show environment
  const { out: envInfo } = await exec(conn, "echo $PATH && mysql --version 2>/dev/null || echo 'mysql not in PATH'");
  console.log("Server PATH / mysql:", envInfo);

  const mysqlBin = await findMySQL(conn);
  if (!mysqlBin) {
    // Diagnose
    const { out: pkgs } = await exec(
      conn,
      "dpkg -l 2>/dev/null | grep -E 'mysql|mariadb' | grep '^ii' | awk '{print $2}' | head -10"
    );
    console.error("MySQL not found. Installed DB packages:", pkgs || "(none)");
    conn.end();
    process.exit(1);
  }
  console.log("MySQL binary:", mysqlBin);

  // Test connection
  const ping = await exec(
    conn,
    `${mysqlBin} -u${DB.user} -p'${DB.password}' -e "SELECT 1 AS ping;" ${DB.name} 2>&1`
  );
  if (ping.code !== 0) {
    console.error("MySQL connection test failed:", ping.err || ping.out);
    conn.end();
    process.exit(1);
  }
  console.log("MySQL connection OK.");

  // Ensure Prisma migrations tracking table exists
  const trackingTable = `
CREATE TABLE IF NOT EXISTS \`_prisma_migrations\` (
  \`id\`                  VARCHAR(36)  NOT NULL PRIMARY KEY,
  \`checksum\`            VARCHAR(64)  NOT NULL,
  \`finished_at\`         DATETIME(3)  NULL,
  \`migration_name\`      VARCHAR(255) NOT NULL,
  \`logs\`                TEXT         NULL,
  \`rolled_back_at\`      DATETIME(3)  NULL,
  \`started_at\`          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`applied_steps_count\` INT UNSIGNED NOT NULL DEFAULT 0
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
  await execSQL(conn, mysqlBin, trackingTable);

  // Collect migration folders
  const migrationsDir = path.resolve(__dirname, "../prisma/migrations");
  const folders = fs
    .readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  let applied = 0;
  for (const folder of folders) {
    const sqlFile = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlFile)) continue;

    const already = await execSQL(
      conn, mysqlBin,
      `SELECT id FROM \`_prisma_migrations\` WHERE migration_name='${folder}' AND finished_at IS NOT NULL;`
    );
    if (already) {
      console.log(`  ✓ ${folder} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(sqlFile, "utf8");
    const id = require("crypto").randomUUID();
    const now = new Date().toISOString().replace("T", " ").slice(0, 23);

    await execSQL(
      conn, mysqlBin,
      `INSERT INTO \`_prisma_migrations\` (id,checksum,migration_name,started_at) VALUES ('${id}','manual','${folder}','${now}');`
    );

    console.log(`  ▶ Applying ${folder} …`);
    try {
      await execSQL(conn, mysqlBin, sql);
      const done = new Date().toISOString().replace("T", " ").slice(0, 23);
      await execSQL(
        conn, mysqlBin,
        `UPDATE \`_prisma_migrations\` SET finished_at='${done}', applied_steps_count=1 WHERE id='${id}';`
      );
      console.log(`  ✓ ${folder} applied successfully.`);
      applied++;
    } catch (err) {
      const errTime = new Date().toISOString().replace("T", " ").slice(0, 23);
      const msg = err.message.replace(/'/g, "\\'").slice(0, 500);
      await execSQL(
        conn, mysqlBin,
        `UPDATE \`_prisma_migrations\` SET logs='${msg}', rolled_back_at='${errTime}' WHERE id='${id}';`
      ).catch(() => {});
      console.error(`  ✗ FAILED: ${err.message}`);
      conn.end();
      process.exit(1);
    }
  }

  conn.end();
  if (applied === 0) {
    console.log("\nAll migrations already applied. Nothing to do.");
  } else {
    console.log(`\n✓ ${applied} migration(s) applied to ${DB.name} on ${SSH.host}`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
