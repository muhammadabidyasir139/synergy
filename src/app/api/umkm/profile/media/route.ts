import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const umkmProfileId = request.headers.get("x-umkm-id");
    if (!umkmProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.umkmProfile.findUnique({ where: { id: umkmProfileId } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const caption = (formData.get("caption") as string) || null;

    if (!file || file.size === 0) return NextResponse.json({ error: "File wajib diunggah." }, { status: 400 });
    if (type !== "LOGO" && type !== "GALLERY") return NextResponse.json({ error: "Tipe media tidak valid." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Ukuran file maksimal 5 MB." }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Format file harus PNG, JPG, atau WEBP." }, { status: 400 });

    if (type === "LOGO") {
      const existingLogo = await db.umkmMedia.findFirst({ where: { umkmProfileId, type: "LOGO" } });
      if (existingLogo) {
        await deleteFromS3(existingLogo.url).catch(() => {});
        await db.umkmMedia.delete({ where: { id: existingLogo.id } });
      }
    }

    const url = await uploadToS3(file, `umkm-media/${umkmProfileId}`);

    const media = await db.umkmMedia.create({
      data: { umkmProfileId, type, url, caption },
    });

    return NextResponse.json({ id: media.id, url: media.url, type: media.type, caption: media.caption }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
