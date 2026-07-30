import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUmkmProfileId } from "@/lib/auth-guard";

// Base URL API AI (FastAPI/XGBoost). Jalan lokal di server yang sama.
const AI_BASE = process.env.AI_API_URL || "http://127.0.0.1:8000";

// GET: ambil riwayat analisis (skor XGBoost) milik UMKM yang login — DATA ASLI dari engine AI.
export async function GET() {
  try {
    const guard = await requireUmkmProfileId();
    if (guard.error) return guard.error;
    const idUmkm = guard.id;

    const res = await fetch(`${AI_BASE}/api/analisis/umkm/${idUmkm}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `AI engine error (HTTP ${res.status})`, data: [] },
        { status: 502 }
      );
    }
    const json = await res.json();
    return NextResponse.json({
      status: "success",
      count: json.count ?? (json.data?.length ?? 0),
      data: json.data ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Tidak bisa terhubung ke AI scoring engine.", data: [] },
      { status: 503 }
    );
  }
}

// POST: trigger scoring ulang — panggil engine AI untuk hitung + prediksi + simpan.
export async function POST() {
  try {
    const guard = await requireUmkmProfileId();
    if (guard.error) return guard.error;
    const idUmkm = guard.id;

    // Ambil data akad_variable terbaru milik UMKM (dibutuhkan engine untuk hitung rasio).
    const akadVar = await db.akadVariable.findFirst({
      where: { umkmProfileId: idUmkm },
      orderBy: { id: "desc" },
      select: { id: true },
    });
    if (!akadVar) {
      return NextResponse.json(
        { error: "Data keuangan (akad_variable) belum ada. Lengkapi Data Usaha dulu." },
        { status: 400 }
      );
    }

    const res = await fetch(`${AI_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_umkm: idUmkm, id_akad_variable: akadVar.id }),
    });
    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: json.detail || `AI engine error (HTTP ${res.status})` },
        { status: 400 }
      );
    }
    return NextResponse.json(json);
  } catch {
    return NextResponse.json(
      { error: "Tidak bisa terhubung ke AI scoring engine." },
      { status: 503 }
    );
  }
}
