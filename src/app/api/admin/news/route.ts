import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 10;

  const [items, total] = await Promise.all([
    db.berita.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { adminProfile: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.berita.count(),
  ]);

  return Response.json({
    news: items.map((b) => ({
      ...b,
      authorName: b.author?.adminProfile?.fullName ?? "Admin",
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, slug, excerpt, content, coverImage, category, isPublished } = body;

  if (!title || !slug || !excerpt || !content) {
    return Response.json({ error: "title, slug, excerpt, content required" }, { status: 400 });
  }

  const existing = await db.berita.findFirst({ where: { slug } });
  if (existing) return Response.json({ error: "Slug sudah digunakan" }, { status: 409 });

  const adminProfile = await db.adminProfile.findFirst({ where: { isSuperAdmin: true } });
  if (!adminProfile) return Response.json({ error: "Super admin not found" }, { status: 500 });

  const berita = await db.berita.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage ?? null,
      category: category || null,
      authorId: adminProfile.userId,
      isPublished: isPublished ?? false,
      publishedAt: isPublished ? new Date() : null,
    },
  });

  return Response.json(berita, { status: 201 });
}
