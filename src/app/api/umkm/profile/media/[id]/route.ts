import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteFromS3 } from "@/lib/s3";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const umkmProfileId = request.headers.get("x-umkm-id");
    if (!umkmProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const media = await db.umkmMedia.findUnique({ where: { id } });
    if (!media || media.umkmProfileId !== umkmProfileId) {
      return NextResponse.json({ error: "Media tidak ditemukan." }, { status: 404 });
    }

    await deleteFromS3(media.url).catch(() => {});
    await db.umkmMedia.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
