import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";
import { requireUmkmProfileId } from "@/lib/auth-guard";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];

export async function POST(request: NextRequest) {
  try {
    const guard = await requireUmkmProfileId();
    if (guard.error) return guard.error;
    const umkmProfileId = guard.id;

    const profile = await db.umkmProfile.findUnique({ where: { id: umkmProfileId } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = ((formData.get("documentType") as string) || "E-KTP").trim();

    if (!file || file.size === 0) return NextResponse.json({ error: "File wajib diunggah." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Ukuran file maksimal 5 MB." }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format file harus PNG, JPG, WEBP, atau PDF." }, { status: 400 });
    }

    const existing = await db.kycDocument.findFirst({
      where: { userId: profile.userId, documentType },
    });
    if (existing) {
      await deleteFromS3(existing.documentUrl).catch(() => {});
      await db.kycDocument.delete({ where: { id: existing.id } });
    }

    const url = await uploadToS3(file, `kyc-documents/${profile.userId}`);

    const doc = await db.kycDocument.create({
      data: { userId: profile.userId, documentType, documentUrl: url, status: "PENDING" },
    });

    await db.user.update({
      where: { id: profile.userId },
      data: { kycStatus: "PENDING" },
    });

    return NextResponse.json(
      { id: doc.id, documentType: doc.documentType, status: doc.status, createdAt: doc.createdAt },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
