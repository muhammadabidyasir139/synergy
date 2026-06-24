import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "6")));
  const category = searchParams.get("category");

  const where = {
    isPublished: true,
    ...(category ? { category } : {}),
  };

  const [items, total] = await Promise.all([
    db.berita.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            adminProfile: { select: { fullName: true } },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.berita.count({ where }),
  ]);

  const news = items.map((b) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    coverImage: b.coverImage,
    category: b.category,
    publishedAt: b.publishedAt,
    authorName: b.author?.adminProfile?.fullName ?? "Admin",
  }));

  return Response.json({ news, total, page, limit, totalPages: Math.ceil(total / limit) });
}
