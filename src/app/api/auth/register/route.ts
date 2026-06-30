import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, email, phoneNumber, password, profile, kycDocumentUrl } = body;

    if (!role || !phoneNumber || !password) {
      return NextResponse.json({ error: "Data wajib tidak lengkap." }, { status: 400 });
    }

    const normalised = phoneNumber.replace(/\D/g, "").replace(/^62/, "0");

    const existingPhone = await db.user.findFirst({ where: { phoneNumber: normalised } });
    if (existingPhone) {
      return NextResponse.json({ error: "Nomor HP sudah terdaftar." }, { status: 409 });
    }

    if (email) {
      const existingEmail = await db.user.findFirst({ where: { email } });
      if (existingEmail) {
        return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userRole = role === "UMKM" ? Role.UMKM : Role.INVESTOR;

    const user = await db.user.create({
      data: {
        email: email || null,
        phoneNumber: normalised,
        passwordHash,
        role: userRole,
        wallet: { create: {} },
      },
    });

    if (userRole === Role.INVESTOR && profile) {
      await db.investorProfile.create({
        data: {
          userId: user.id,
          fullName: profile.fullName,
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
          address: profile.address || null,
          city: profile.city || null,
          province: profile.province || null,
          investmentGoal: profile.investmentGoal || null,
          riskTolerance: profile.riskTolerance || "MEDIUM",
        },
      });
    }

    if (userRole === Role.UMKM && profile) {
      await db.umkmProfile.create({
        data: {
          userId: user.id,
          ownerName: profile.ownerName,
          businessName: profile.businessName,
          businessCategory: profile.businessCategory,
          businessDescription: profile.businessDescription || null,
          location: profile.location || null,
          city: profile.city || null,
          province: profile.province || null,
          establishedDate: profile.establishedDate ? new Date(profile.establishedDate) : null,
          employeeCount: profile.employeeCount ? parseInt(profile.employeeCount) : null,
          monthlyRevenue: profile.monthlyRevenue ? parseFloat(profile.monthlyRevenue) : null,
          website: profile.website || null,
          socialMedia: profile.socialMedia || null,
        },
      });
    }

    if (kycDocumentUrl) {
      await db.kycDocument.create({
        data: {
          userId: user.id,
          documentType: "E-KTP",
          documentUrl: kycDocumentUrl,
        },
      });
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
