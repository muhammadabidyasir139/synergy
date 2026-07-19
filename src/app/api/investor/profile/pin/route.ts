import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { isValidPinFormat, verifyInvestorPin } from "@/lib/investor-pin";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.investorProfile.findUnique({ where: { id: investorProfileId } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const locked = !!(profile.pinLockedUntil && profile.pinLockedUntil > new Date());

    return NextResponse.json({
      hasPin: !!profile.transactionPinHash,
      pinSetAt: profile.pinSetAt,
      locked,
      lockedUntil: locked ? profile.pinLockedUntil : null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPin, newPin } = await request.json();

    if (!isValidPinFormat(newPin)) {
      return NextResponse.json({ error: "PIN baru harus terdiri dari 6 digit angka." }, { status: 400 });
    }

    const profile = await db.investorProfile.findUnique({ where: { id: investorProfileId } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    if (profile.transactionPinHash) {
      if (!isValidPinFormat(currentPin)) {
        return NextResponse.json({ error: "PIN saat ini wajib diisi untuk mengganti PIN." }, { status: 400 });
      }
      const verify = await verifyInvestorPin(investorProfileId, currentPin);
      if (!verify.ok) return NextResponse.json({ error: verify.error }, { status: verify.status });
    }

    const transactionPinHash = await bcrypt.hash(newPin, 12);
    await db.investorProfile.update({
      where: { id: investorProfileId },
      data: {
        transactionPinHash,
        pinSetAt: new Date(),
        pinFailedAttempts: 0,
        pinLockedUntil: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
