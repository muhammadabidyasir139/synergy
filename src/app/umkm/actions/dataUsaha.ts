"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function getUmkmProfileId() {
  const profile = await db.umkmProfile.findFirst();
  return profile?.id || "";
}

export async function createDataUsaha(data: {
  tanggal: string;
  omzet: number;
  pengeluaran: number;
  keterangan: string;
}) {
  const profileId = await getUmkmProfileId();
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

export async function getDataUsaha() {
  const profileId = await getUmkmProfileId();
  if (!profileId) return [];

  const dataUsaha = await db.businessData.findMany({
    where: { umkmProfileId: profileId, dataSource: "MANUAL" },
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
