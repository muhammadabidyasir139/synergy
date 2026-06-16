import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const berita = await db.berita.findFirst({
    where: { id },
    include: { author: { select: { adminProfile: { select: { fullName: true } } } } },
  });
  if (!berita) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(berita);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { title, slug, excerpt, content, coverImage, category, isPublished } = body;

  const existing = await db.berita.findFirst({ where: { id } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  if (slug && slug !== existing.slug) {
    const slugConflict = await db.berita.findFirst({ where: { slug } });
    if (slugConflict) return Response.json({ error: "Slug sudah digunakan" }, { status: 409 });
  }

  const wasPublished = existing.isPublished;
  const nowPublished = isPublished !== undefined ? isPublished : existing.isPublished;

  const updated = await db.berita.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(excerpt !== undefined && { excerpt }),
      ...(content !== undefined && { content }),
      ...(coverImage !== undefined && { coverImage }),
      ...(category !== undefined && { category: category || null }),
      isPublished: nowPublished,
      publishedAt: nowPublished && !wasPublished ? new Date() : existing.publishedAt,
    },
  });

  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await db.berita.findFirst({ where: { id } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await db.berita.delete({ where: { id } });
  return Response.json({ success: true });
}
