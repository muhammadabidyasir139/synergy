import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUmkmProfileId } from "@/lib/auth-guard";

// Base URL API AI (FastAPI/XGBoost). Jalan lokal di server yang sama.
const AI_BASE = process.env.AI_API_URL || "http://127.0.0.1:8000";

// GET: ambil riwayat analisis (skor XGBoost) milik UMKM yang login — DATA ASLI dari engine AI, dengan fallback ke DB.
export async function GET(request: NextRequest) {
  try {
    const guard = await requireUmkmProfileId(request);
    if (guard.error) return guard.error;
    const idUmkm = guard.id;

    try {
      const res = await fetch(`${AI_BASE}/api/analisis/umkm/${idUmkm}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json({
          status: "success",
          count: json.count ?? (json.data?.length ?? 0),
          data: json.data ?? [],
        });
      }
    } catch {
      // Python AI engine offline -> fallback ke DB credit_scores
    }

    const dbScores = await db.creditScore.findMany({
      where: { umkmProfileId: idUmkm },
      orderBy: { predictedAt: "desc" },
    });

    const mapped = dbScores.map((s, idx) => {
      const feats = (s.features as Record<string, number> | null) ?? {};
      return {
        id: idx + 1,
        id_umkm: s.umkmProfileId,
        id_akad_variable: 1,
        current_ratio: feats.current_ratio ?? 1.5,
        net_profit_margin: feats.net_profit_margin ?? 0.15,
        operating_expense_ratio: feats.operating_expense_ratio ?? 0.4,
        cashflow_stability_risk: feats.cashflow_stability_risk ?? 0.1,
        asset_turnover_ratio: feats.asset_turnover_ratio ?? 1.2,
        revenue_growth: feats.revenue_growth ?? 0.1,
        skor_kelayakan: s.score,
        akad: (s.recommendations as Record<string, string> | null)?.akad ?? (s.riskLevel === "LOW" ? "Musyarakah" : "Murabahah"),
      };
    });

    return NextResponse.json({
      status: "success",
      count: mapped.length,
      data: mapped,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal memuat data credit scoring.", data: [] },
      { status: 500 }
    );
  }
}

// POST: trigger scoring ulang — panggil engine AI untuk hitung + prediksi + simpan.
export async function POST(request: NextRequest) {
  try {
    const guard = await requireUmkmProfileId(request);
    if (guard.error) return guard.error;
    const idUmkm = guard.id;

    // Ambil data akad_variable terbaru milik UMKM (dibutuhkan engine untuk hitung rasio).
    const akadVar = await db.akadVariable.findFirst({
      where: { umkmProfileId: idUmkm },
      orderBy: { id: "desc" },
    });
    if (!akadVar) {
      return NextResponse.json(
        { error: "Data keuangan (Profil Keuangan) belum lengkap. Isi Profil Keuangan dulu di menu Profil." },
        { status: 400 }
      );
    }

    try {
      const res = await fetch(`${AI_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_umkm: idUmkm, id_akad_variable: akadVar.id }),
      });
      const json = await res.json();
      if (res.ok) return NextResponse.json(json);
    } catch {
      // Engine AI offline -> fallback kalkulasi lokal & simpan ke DB
    }

    // Fallback scoring lokal berbasis rasio keuangan
    const rev = Number(akadVar.totalPendapatan) || 1;
    const netProfit = Number(akadVar.labaBersih) || 0;
    const assets = Number(akadVar.asetLancar) + Number(akadVar.asetTidakLancar) || 1;
    const npm = netProfit / rev;
    const ato = rev / assets;
    const currentRatio = Number(akadVar.totalHutangKas) > 0 ? Number(akadVar.asetLancar) / Number(akadVar.totalHutangKas) : 2.0;

    let score = 50 + npm * 100 + Math.min(ato, 2) * 10 + Math.min(currentRatio, 3) * 5;
    score = Math.max(30, Math.min(95, Math.round(score)));
    const riskLevel = score >= 75 ? "LOW" : score >= 50 ? "MEDIUM" : "HIGH";
    const recommendedAkad = score >= 70 ? "Musyarakah" : "Murabahah";

    const saved = await db.creditScore.create({
      data: {
        umkmProfileId: idUmkm,
        score,
        riskLevel,
        modelVersion: "1.0-fallback",
        features: {
          current_ratio: currentRatio,
          net_profit_margin: npm,
          operating_expense_ratio: Number(akadVar.totalBeban) / rev,
          cashflow_stability_risk: 0.1,
          asset_turnover_ratio: ato,
          revenue_growth: 0.1,
        },
        insights: { key_factors: ["Pertumbuhan omzet positif", "Rasio kas stabil"] },
        recommendations: { akad: recommendedAkad, actions: ["Pertahankan pencatatan kas harian"] },
        triggeredBy: "UMKM",
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Scoring AI selesai (mode lokal)",
      data: {
        id: saved.id,
        skor_kelayakan: saved.score,
        akad: recommendedAkad,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal memproses scoring AI." },
      { status: 500 }
    );
  }
}
