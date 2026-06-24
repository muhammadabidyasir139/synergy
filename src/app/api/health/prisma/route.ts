import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.$queryRaw`SELECT NOW() AS now`;

    return NextResponse.json({
      ok: true,
      message: "Prisma connected to MariaDB/MySQL",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Prisma connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
