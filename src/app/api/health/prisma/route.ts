import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() AS now`;

    return NextResponse.json({
      ok: true,
      message: "Prisma connected to PostgreSQL",
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
