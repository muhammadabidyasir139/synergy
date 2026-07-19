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

  revalidatePath("/umkm/dashboard/data-usaha");
  return { success: true, id: result.id };
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
