"use server"

import { db } from "@/lib/db";
import { AkadType, FundingStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export async function isFinanceProfileComplete(umkmProfileId: string): Promise<boolean> {
  if (!umkmProfileId) return false;

  const variable = await db.akadVariable.findFirst({ where: { umkmProfileId } });
  return !!variable;
}

export async function createPengajuan(umkmProfileId: string, data: {
  jumlah: number;
  jenis: "Musyarakah" | "Murabahah";
  durasi: number;
  tujuan: string;
}) {
  const profileId = umkmProfileId;
  if (!profileId) throw new Error("UMKM Profile not found");

  const financeComplete = await isFinanceProfileComplete(profileId);
  if (!financeComplete) {
    throw new Error("Lengkapi Profil Keuangan terlebih dahulu di halaman Profil & Setup Usaha sebelum mengajukan pendanaan.");
  }

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

export async function getPengajuans(umkmProfileId: string) {
  if (!umkmProfileId) return [];

  const pengajuans = await db.fundingApplication.findMany({
    where: { umkmProfileId },
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
