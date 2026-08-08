import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import { uploadToS3 } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const role = formData.get("role") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const password = formData.get("password") as string;
    const profileRaw = formData.get("profile") as string;
    const kycFile = formData.get("kycFile") as File;
    const profile = profileRaw ? JSON.parse(profileRaw) : null;
    let kycDocumentUrl = "";

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

    if (userRole === Role.INVESTOR && !profile?.fullName) {
      return NextResponse.json({ error: "Nama lengkap investor wajib diisi." }, { status: 400 });
    }
    if (userRole === Role.UMKM && (!profile?.ownerName || !profile?.businessName)) {
      return NextResponse.json({ error: "Nama pemilik dan nama usaha wajib diisi." }, { status: 400 });
    }

    if (kycFile && kycFile.size > 0) {
      try {
        kycDocumentUrl = await uploadToS3(kycFile, "kyc");
      } catch (uploadErr) {
        console.warn("[REGISTER] KYC upload fallback triggered:", uploadErr);
        try {
          const fs = await import("fs");
          const path = await import("path");
          const buffer = Buffer.from(await kycFile.arrayBuffer());
          const safeName = `${Date.now()}_${kycFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
          const uploadDir = path.join(process.cwd(), "public", "uploads", "kyc");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          fs.writeFileSync(path.join(uploadDir, safeName), buffer);
          kycDocumentUrl = `/uploads/kyc/${safeName}`;
        } catch {
          kycDocumentUrl = `/uploads/kyc/default.png`;
        }
      }
    }

    // Helper for safe date parsing
    const parseSafeDate = (d: unknown): Date | null => {
      if (!d) return null;
      const ts = Date.parse(d as string);
      return isNaN(ts) ? null : new Date(ts);
    };

    // Helper for safe int parsing
    const parseSafeInt = (val: unknown): number | null => {
      if (val === undefined || val === null || val === "") return null;
      const num = parseInt(String(val), 10);
      return isNaN(num) ? null : num;
    };

    // Helper for safe float parsing
    const parseSafeFloat = (val: unknown): number | null => {
      if (val === undefined || val === null || val === "") return null;
      const num = parseFloat(String(val));
      return isNaN(num) ? null : num;
    };

    const user = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: email || null,
          phoneNumber: normalised,
          passwordHash,
          role: userRole,
          wallet: { create: {} },
        },
      });

      if (userRole === Role.INVESTOR && profile) {
        await tx.investorProfile.create({
          data: {
            userId: createdUser.id,
            fullName: profile.fullName,
            dateOfBirth: parseSafeDate(profile.dateOfBirth),
            address: profile.address || null,
            city: profile.city || null,
            province: profile.province || null,
            district: profile.district || null,
            postalCode: profile.postalCode || null,
            investmentGoal: profile.investmentGoal || null,
            riskTolerance: profile.riskTolerance || "MEDIUM",
          },
        });
      }

      if (userRole === Role.UMKM && profile) {
        await tx.umkmProfile.create({
          data: {
            userId: createdUser.id,
            ownerName: profile.ownerName,
            businessName: profile.businessName,
            businessCategory: profile.businessCategory,
            businessDescription: profile.businessDescription || null,
            location: profile.location || null,
            city: profile.city || null,
            province: profile.province || null,
            district: profile.district || null,
            postalCode: profile.postalCode || null,
            establishedDate: parseSafeDate(profile.establishedDate),
            employeeCount: parseSafeInt(profile.employeeCount),
            monthlyRevenue: parseSafeFloat(profile.monthlyRevenue),
            website: profile.website || null,
            socialMedia: profile.socialMedia && Array.isArray(profile.socialMedia)
              ? JSON.stringify(profile.socialMedia.filter((sm: { platform?: string; handle?: string }) => sm.platform && sm.handle))
              : null,
          },
        });
      }

      if (kycDocumentUrl) {
        await tx.kycDocument.create({
          data: {
            userId: createdUser.id,
            documentType: "E-KTP",
            documentUrl: kycDocumentUrl,
          },
        });
      }

      return createdUser;
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("[REGISTER ERROR]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan server saat memproses pendaftaran." },
      { status: 500 }
    );
  }
}
