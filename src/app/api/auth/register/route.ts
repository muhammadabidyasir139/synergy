import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

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

    if (kycFile && kycFile.size > 0) {
      const buffer = Buffer.from(await kycFile.arrayBuffer());
      const fileName = `kyc/${Date.now()}_${kycFile.name.replace(/\s+/g, '_')}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: kycFile.type,
      }));

      kycDocumentUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;
    }

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
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
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
            establishedDate: profile.establishedDate ? new Date(profile.establishedDate) : null,
            employeeCount: profile.employeeCount ? parseInt(profile.employeeCount) : null,
            monthlyRevenue: profile.monthlyRevenue ? parseFloat(profile.monthlyRevenue) : null,
            website: profile.website || null,
            socialMedia: profile.socialMedia && Array.isArray(profile.socialMedia) ? JSON.stringify(profile.socialMedia.filter((sm: any) => sm.platform && sm.handle)) : null,
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
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
