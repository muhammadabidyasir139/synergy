import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RiskLevel } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.investorProfile.findUnique({
      where: { id: investorProfileId },
      include: { user: true },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    return NextResponse.json({
      fullName: profile.fullName,
      email: profile.user.email ?? "",
      phoneNumber: profile.user.phoneNumber,
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      province: profile.province ?? "",
      district: profile.district ?? "",
      postalCode: profile.postalCode ?? "",
      investmentGoal: profile.investmentGoal ?? "",
      riskTolerance: profile.riskTolerance,
      hasPin: !!profile.transactionPinHash,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { fullName, dateOfBirth, address, city, province, district, postalCode, investmentGoal, riskTolerance } = body;

    if (riskTolerance && !Object.values(RiskLevel).includes(riskTolerance)) {
      return NextResponse.json({ error: "Toleransi risiko tidak valid." }, { status: 400 });
    }

    const updated = await db.investorProfile.update({
      where: { id: investorProfileId },
      data: {
        fullName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        city,
        province,
        district,
        postalCode,
        investmentGoal,
        riskTolerance: riskTolerance ?? undefined,
      },
    });

    return NextResponse.json({ success: true, fullName: updated.fullName });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
