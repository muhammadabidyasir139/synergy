import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUmkmProfileId } from "@/lib/auth-guard";

const FIELDS = [
  "asetLancar",
  "totalHutangKas",
  "labaBersih",
  "totalPendapatan",
  "totalBeban",
  "rataRataArusKas",
  "asetTidakLancar",
] as const;

type FinanceField = (typeof FIELDS)[number];

export async function GET(request: NextRequest) {
  try {
    const guard = await requireUmkmProfileId(request);
    if (guard.error) return guard.error;
    const umkmProfileId = guard.id;

    const variable = await db.akadVariable.findFirst({
      where: { umkmProfileId },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      asetLancar: variable ? Number(variable.asetLancar) : null,
      totalHutangKas: variable ? Number(variable.totalHutangKas) : null,
      labaBersih: variable ? Number(variable.labaBersih) : null,
      totalPendapatan: variable ? Number(variable.totalPendapatan) : null,
      totalBeban: variable ? Number(variable.totalBeban) : null,
      rataRataArusKas: variable ? Number(variable.rataRataArusKas) : null,
      asetTidakLancar: variable ? Number(variable.asetTidakLancar) : null,
      isComplete: !!variable,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guard = await requireUmkmProfileId(request);
    if (guard.error) return guard.error;
    const umkmProfileId = guard.id;

    const profile = await db.umkmProfile.findUnique({ where: { id: umkmProfileId } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const body = await request.json();
    const values: Record<FinanceField, number> = {} as Record<FinanceField, number>;

    for (const field of FIELDS) {
      const raw = body[field];
      const num = Number(raw);
      if (raw === undefined || raw === null || raw === "" || Number.isNaN(num) || num < 0) {
        return NextResponse.json({ error: `Field ${field} wajib diisi dengan angka valid (>= 0).` }, { status: 400 });
      }
      values[field] = num;
    }

    const existing = await db.akadVariable.findFirst({
      where: { umkmProfileId },
      orderBy: { id: "desc" },
    });

    if (existing) {
      await db.akadVariable.update({ where: { id: existing.id }, data: values });
    } else {
      await db.akadVariable.create({ data: { umkmProfileId, ...values } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
