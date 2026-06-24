import { NextResponse } from "next/server";
import { pool, testDbConnection } from "@/lib/db";

export async function GET() {
  try {
    const result = await testDbConnection();

    return NextResponse.json({
      ok: true,
      message: "PostgreSQL connection is active",
      now: result.now,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "PostgreSQL connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
