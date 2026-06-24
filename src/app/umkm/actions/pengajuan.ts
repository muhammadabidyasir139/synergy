"use server"

import { db } from "@/lib/db";
import { AkadType, FundingStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

// Mock function to get the current UMKM ID for testing
async function getUmkmProfileId() {
  const profile = await db.umkmProfile.findFirst();
  return profile?.id || "";
}

export async function createPengajuan(data: {
  jumlah: number;
  jenis: "Musyarakah" | "Murabahah";
  durasi: number;
  tujuan: string;
}) {
  const profileId = await getUmkmProfileId();
  if (!profileId) throw new Error("UMKM Profile not found");

  const akadType = data.jenis === "Musyarakah" ? AkadType.MUSYARAKAH : AkadType.MURABAHAH;

  const result = await db.fundingApplication.create({
    data: {
      umkmProfileId: profileId,
      akadType,
      requestedAmount: data.jumlah,
      durationMonths: data.durasi,
      purpose: data.tujuan,
      status: FundingStatus.PENDING,
    }
  });

  revalidatePath("/umkm/dashboard/pengajuan");
  return { success: true, id: result.id };
}

export async function getPengajuans() {
  const profileId = await getUmkmProfileId();
  if (!profileId) return [];

  const pengajuans = await db.fundingApplication.findMany({
    where: { umkmProfileId: profileId },
    orderBy: { createdAt: "desc" }
  });

  return pengajuans.map(p => ({
    id: p.id,
    jenis: p.akadType === AkadType.MUSYARAKAH ? "Musyarakah" : "Murabahah",
    jumlah: `Rp ${Number(p.requestedAmount).toLocaleString("id-ID")}`,
    durasi: `${p.durationMonths} bulan`,
    deskripsi: p.purpose,
    status: p.status === FundingStatus.APPROVED ? "Approved" : p.status === FundingStatus.REJECTED ? "Rejected" : "Pending",
    tanggal: p.createdAt.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
  }));
}
