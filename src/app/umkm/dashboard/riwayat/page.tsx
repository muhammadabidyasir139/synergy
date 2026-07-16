import { db } from "@/lib/db";
import RiwayatClient from "./RiwayatClient";

export default async function RiwayatTransaksi() {
  // Ambil profil UMKM beserta user dan wallet-nya
  const profile = await db.umkmProfile.findFirst({
    include: {
      user: {
        include: {
          wallet: {
            include: {
              transactions: {
                orderBy: { createdAt: "desc" }
              }
            }
          }
        }
      }
    }
  });

  const transactions = profile?.user?.wallet?.transactions || [];

  // Format data untuk dikirim ke Client Component
  const formattedTransactions = transactions.map(t => ({
    id: t.id,
    tanggal: t.createdAt.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
    tipe: t.type,
    keterangan: t.description || "",
    jumlah: (t.type === "WITHDRAWAL" || t.type === "PLATFORM_FEE" || t.type === "PROFIT_SHARING" ? -1 : 1) * Number(t.amount),
    status: t.status,
    akad: t.reference || undefined,
  }));

  return (
    <RiwayatClient transaksiAll={formattedTransactions} />
  );
}

