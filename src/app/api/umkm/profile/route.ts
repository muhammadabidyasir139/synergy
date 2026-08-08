import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedMediaUrl } from "@/lib/s3";
import { requireUmkmProfileId } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireUmkmProfileId(request);
    if (guard.error) return guard.error;
    const umkmProfileId = guard.id;

    const profile = await db.umkmProfile.findUnique({
      where: { id: umkmProfileId },
      include: {
        user: {
          include: {
            kycDocuments: { orderBy: { createdAt: "desc" } },
          },
        },
        media: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const logoMedia = profile.media.find((m) => m.type === "LOGO") ?? null;
    const galleryMedia = profile.media.filter((m) => m.type === "GALLERY");
    const [logoSignedUrl, gallerySignedUrls] = await Promise.all([
      logoMedia ? getSignedMediaUrl(logoMedia.url) : Promise.resolve(null),
      Promise.all(galleryMedia.map((m) => getSignedMediaUrl(m.url))),
    ]);

    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      businessName: profile.businessName,
      businessCategory: profile.businessCategory,
      businessDescription: profile.businessDescription ?? "",
      ownerName: profile.ownerName,
      location: profile.location ?? "",
      city: profile.city ?? "",
      province: profile.province ?? "",
      establishedDate: profile.establishedDate ? profile.establishedDate.toISOString().slice(0, 10) : "",
      employeeCount: profile.employeeCount ?? "",
      website: profile.website ?? "",
      email: profile.user.email ?? "",
      phoneNumber: profile.user.phoneNumber,
      kycStatus: profile.user.kycStatus,
      accountStatus: profile.user.status,
      kycDocuments: profile.user.kycDocuments.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        status: d.status,
        reviewedAt: d.reviewedAt,
        createdAt: d.createdAt,
      })),
      logo: logoMedia ? { id: logoMedia.id, url: logoSignedUrl, caption: logoMedia.caption, createdAt: logoMedia.createdAt } : null,
      gallery: galleryMedia.map((m, i) => ({
        id: m.id,
        url: gallerySignedUrls[i],
        caption: m.caption,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const guard = await requireUmkmProfileId(request);
    if (guard.error) return guard.error;
    const umkmProfileId = guard.id;

    const profile = await db.umkmProfile.findUnique({ where: { id: umkmProfileId } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const body = await request.json();

    await db.umkmProfile.update({
      where: { id: umkmProfileId },
      data: {
        businessName: body.businessName ?? undefined,
        businessCategory: body.businessCategory ?? undefined,
        businessDescription: body.businessDescription ?? undefined,
        ownerName: body.ownerName ?? undefined,
        location: body.location ?? undefined,
        city: body.city ?? undefined,
        province: body.province ?? undefined,
        employeeCount: body.employeeCount !== undefined && body.employeeCount !== ""
          ? parseInt(body.employeeCount) : undefined,
        website: body.website ?? undefined,
      },
    });

    if (body.email !== undefined || body.phoneNumber !== undefined) {
      await db.user.update({
        where: { id: profile.userId },
        data: {
          email: body.email || undefined,
          phoneNumber: body.phoneNumber ? body.phoneNumber.replace(/\D/g, "").replace(/^62/, "0") : undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
