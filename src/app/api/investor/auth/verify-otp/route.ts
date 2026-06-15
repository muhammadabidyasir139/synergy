import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OtpPurpose, Role } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Nomor HP dan OTP wajib diisi." }, { status: 400 });
    }

    const normalised = phone.replace(/\D/g, "").replace(/^62/, "0");

    const user = await db.user.findUnique({
      where: { phoneNumber: normalised },
      include: { investorProfile: true, wallet: true },
    });

    if (!user || user.role !== Role.INVESTOR) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    const record = await db.otpVerification.findFirst({
      where: {
        userId: user.id,
        otp,
        purpose: OtpPurpose.LOGIN,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "OTP salah atau sudah kadaluarsa." }, { status: 400 });
    }

    await db.otpVerification.update({ where: { id: record.id }, data: { isUsed: true, usedAt: new Date() } });
    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return NextResponse.json({
      success: true,
      session: {
        userId: user.id,
        investorProfileId: user.investorProfile?.id ?? "",
        fullName: user.investorProfile?.fullName ?? "Investor",
        kycStatus: user.kycStatus,
        riskTolerance: user.investorProfile?.riskTolerance ?? "MEDIUM",
        walletBalance: Number(user.wallet?.balance ?? 0),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
