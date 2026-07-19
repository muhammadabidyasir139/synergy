import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export function isValidPinFormat(pin: unknown): pin is string {
  return typeof pin === "string" && /^\d{6}$/.test(pin);
}

export async function verifyInvestorPin(
  investorProfileId: string,
  pin: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const profile = await db.investorProfile.findUnique({ where: { id: investorProfileId } });
  if (!profile) return { ok: false, status: 404, error: "Profil investor tidak ditemukan." };

  if (!profile.transactionPinHash) {
    return { ok: false, status: 400, error: "PIN transaksi belum diatur. Silakan atur PIN di menu Profil & Keamanan." };
  }

  if (profile.pinLockedUntil && profile.pinLockedUntil > new Date()) {
    const minutesLeft = Math.ceil((profile.pinLockedUntil.getTime() - Date.now()) / 60000);
    return { ok: false, status: 423, error: `PIN terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${minutesLeft} menit.` };
  }

  const isMatch = await bcrypt.compare(pin, profile.transactionPinHash);
  if (!isMatch) {
    const attempts = profile.pinFailedAttempts + 1;
    const locked = attempts >= MAX_PIN_ATTEMPTS;
    await db.investorProfile.update({
      where: { id: investorProfileId },
      data: {
        pinFailedAttempts: locked ? 0 : attempts,
        pinLockedUntil: locked ? new Date(Date.now() + LOCKOUT_MINUTES * 60000) : null,
      },
    });
    return {
      ok: false,
      status: 401,
      error: locked
        ? `PIN salah. Terlalu banyak percobaan gagal, akun dikunci ${LOCKOUT_MINUTES} menit.`
        : "PIN transaksi salah.",
    };
  }

  if (profile.pinFailedAttempts > 0 || profile.pinLockedUntil) {
    await db.investorProfile.update({
      where: { id: investorProfileId },
      data: { pinFailedAttempts: 0, pinLockedUntil: null },
    });
  }

  return { ok: true };
}
