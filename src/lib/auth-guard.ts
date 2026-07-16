import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

type GuardResult<T> = { id: T; error?: undefined } | { id?: undefined; error: NextResponse };

export async function requireInvestorProfileId(): Promise<GuardResult<string>> {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const profile = await db.investorProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });
  if (!profile) {
    return { error: NextResponse.json({ error: "Investor profile not found" }, { status: 404 }) };
  }

  return { id: profile.id };
}

export async function requireUmkmProfileId(): Promise<GuardResult<string>> {
  const session = await getSession();
  if (!session || session.role !== "UMKM") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const profile = await db.umkmProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });
  if (!profile) {
    return { error: NextResponse.json({ error: "UMKM profile not found" }, { status: 404 }) };
  }

  return { id: profile.id };
}

export async function requireAdminSession(): Promise<GuardResult<string>> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { id: session.userId };
}
