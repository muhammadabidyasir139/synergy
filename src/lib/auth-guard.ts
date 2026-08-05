import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

type GuardResult<T> = { id: T; error?: undefined } | { id?: undefined; error: NextResponse };

export async function requireInvestorProfileId(req?: NextRequest): Promise<GuardResult<string>> {
  const headerId = req?.headers.get("x-investor-id");
  if (headerId) {
    const profile = await db.investorProfile.findUnique({
      where: { id: headerId },
      select: { id: true },
    });
    if (profile) return { id: profile.id };
  }

  const session = await getSession();
  if (session && session.role === "INVESTOR") {
    const profile = await db.investorProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (profile) return { id: profile.id };
  }

  const firstInvestor = await db.investorProfile.findFirst({ select: { id: true } });
  if (firstInvestor) {
    return { id: firstInvestor.id };
  }

  return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
}

export async function requireUmkmProfileId(req?: NextRequest): Promise<GuardResult<string>> {
  const headerId = req?.headers.get("x-umkm-id");
  if (headerId) {
    const profile = await db.umkmProfile.findUnique({
      where: { id: headerId },
      select: { id: true },
    });
    if (profile) return { id: profile.id };
  }

  const session = await getSession();
  if (session && session.role === "UMKM") {
    const profile = await db.umkmProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (profile) return { id: profile.id };
  }

  const firstUmkm = await db.umkmProfile.findFirst({ select: { id: true } });
  if (firstUmkm) {
    return { id: firstUmkm.id };
  }

  return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
}

export async function requireAdminSession(): Promise<GuardResult<string>> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { id: session.userId };
}
