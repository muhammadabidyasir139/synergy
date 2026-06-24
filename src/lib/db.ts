import { Pool, type QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`;

export const pool = new Pool({
  connectionString,
  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  const result = await pool.query<T>(text, params);
  return result;
}

export async function testDbConnection(): Promise<{ now: Date }> {
  const result = await pool.query<{ now: Date }>("SELECT NOW() AS now");
  return result.rows[0];
}
