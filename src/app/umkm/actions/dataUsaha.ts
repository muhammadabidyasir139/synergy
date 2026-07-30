"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createDataUsaha(umkmProfileId: string, data: {
  tanggal: string;
  omzet: number;
  pengeluaran: number;
  keterangan: string;
}) {
  const profileId = umkmProfileId;
  if (!profileId) throw new Error("UMKM Profile not found");

  const [year, month, day] = data.tanggal.split("-").map(Number);
  const reportDate = new Date(year, month - 1, day);

  const result = await db.businessData.create({
    data: {
      umkmProfileId: profileId,
      reportDate: reportDate,
      dailyRevenue: data.omzet,
      dailyExpense: data.pengeluaran,
      dataSource: "MANUAL",
      rawData: data.keterangan ? { keterangan: data.keterangan } : {},
    }
  });

  // Akumulasi omzet harian → pendapatan_bulanan (yang dibaca engine AI XGBoost, min. 2 bulan).
  // Non-fatal: kalau sinkronisasi gagal, penyimpanan data usaha tetap sukses.
  try {
    await syncPendapatanBulanan(profileId, year, month);
  } catch (e) {
    console.error("[dataUsaha] gagal sinkron pendapatan_bulanan:", e);
  }

  revalidatePath("/umkm/dashboard/data-usaha");
  return { success: true, id: result.id };
}

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// Jumlahkan seluruh omzet harian pada bulan+tahun tertentu, lalu upsert ke pendapatan_bulanan.
// revenue_growth dibiarkan NULL — engine AI menghitungnya otomatis dari urutan jumlah antar bulan.
async function syncPendapatanBulanan(profileId: string, year: number, month: number) {
  const bulan = NAMA_BULAN[month - 1];
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const agg = await db.businessData.aggregate({
    _sum: { dailyRevenue: true },
    where: {
      umkmProfileId: profileId,
      reportDate: { gte: monthStart, lt: monthEnd },
    },
  });
  const jumlah = Number(agg._sum.dailyRevenue ?? 0);

  const existing = await db.$queryRaw<{ id: number }[]>`
    SELECT id FROM pendapatan_bulanan
    WHERE id_umkm = ${profileId} AND bulan = ${bulan} AND tahun = ${year}
    LIMIT 1
  `;

  if (existing.length > 0) {
    await db.$executeRaw`
      UPDATE pendapatan_bulanan SET jumlah = ${jumlah} WHERE id = ${existing[0].id}
    `;
  } else {
    await db.$executeRaw`
      INSERT INTO pendapatan_bulanan (id_umkm, bulan, tahun, jumlah)
      VALUES (${profileId}, ${bulan}, ${year}, ${jumlah})
    `;
  }
}

// Import massal dari Excel: buat banyak baris businessData sekaligus, lalu sinkron pendapatan_bulanan
// hanya untuk bulan-bulan yang terpengaruh (efisien). Mengembalikan jumlah sukses + daftar error per baris.
export async function bulkCreateDataUsaha(
  umkmProfileId: string,
  rows: { tanggal: string; omzet: number; pengeluaran: number; keterangan?: string }[]
) {
  if (!umkmProfileId) throw new Error("UMKM Profile not found");

  const affectedMonths = new Set<string>();
  let inserted = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      const [year, month, day] = String(r.tanggal).split("-").map(Number);
      if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
        throw new Error("format tanggal harus YYYY-MM-DD");
      }
      await db.businessData.create({
        data: {
          umkmProfileId,
          reportDate: new Date(year, month - 1, day),
          dailyRevenue: Number(r.omzet) || 0,
          dailyExpense: Number(r.pengeluaran) || 0,
          dataSource: "MANUAL",
          rawData: r.keterangan ? { keterangan: r.keterangan } : {},
        },
      });
      affectedMonths.add(`${year}-${month}`);
      inserted++;
    } catch (e) {
      errors.push(`Baris ${i + 2}: ${(e as Error).message}`);
    }
  }

  for (const key of affectedMonths) {
    const [y, m] = key.split("-").map(Number);
    try {
      await syncPendapatanBulanan(umkmProfileId, y, m);
    } catch (e) {
      console.error("[bulkDataUsaha] gagal sinkron pendapatan_bulanan:", e);
    }
  }

  revalidatePath("/umkm/dashboard/data-usaha");
  return { success: true, inserted, errors };
}

export async function getDataUsaha(umkmProfileId: string) {
  if (!umkmProfileId) return [];

  const dataUsaha = await db.businessData.findMany({
    where: { umkmProfileId, dataSource: "MANUAL" },
    orderBy: { reportDate: "desc" }
  });

  return dataUsaha.map(d => ({
    id: d.id,
    tanggal: d.reportDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
    omzet: `Rp ${Number(d.dailyRevenue || d.monthlyRevenue || 0).toLocaleString("id-ID")}`,
    pengeluaran: `Rp ${Number(d.dailyExpense || d.monthlyExpense || 0).toLocaleString("id-ID")}`,
    laba: `Rp ${(Number(d.dailyRevenue || d.monthlyRevenue || 0) - Number(d.dailyExpense || d.monthlyExpense || 0)).toLocaleString("id-ID")}`,
    sumber: d.dataSource === "MANUAL" ? "Manual" as const : "API" as const
  }));
}
