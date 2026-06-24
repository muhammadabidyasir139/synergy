import { defineConfig, env } from "prisma/config";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ESM-compatible __dirname (jiti/c12 may run this in ESM context)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, ".env") });

export default defineConfig({
  migrations: {
    seed: "npx tsx ./prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
    // shadowDatabaseUrl is needed for `prisma migrate dev` when the DB user
    // cannot CREATE databases. Set SHADOW_DATABASE_URL in .env, or use
    // `prisma db push` as an alternative (no shadow DB required).
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
