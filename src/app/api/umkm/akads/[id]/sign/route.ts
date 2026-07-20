import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUmkmProfileId } from "@/lib/auth-guard";
import { signAkadAndSync } from "@/lib/akad-signing";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireUmkmProfileId();
    if (guard.error) return guard.error;

    const { id } = await params;

    const akad = await db.akad.findUnique({
      where: { id },
      include: { campaign: { select: { umkmProfileId: true } } },
    });

    if (!akad) return NextResponse.json({ error: "Akad not found" }, { status: 404 });
    if (akad.campaign.umkmProfileId !== guard.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (akad.umkmSignedAt) {
      return NextResponse.json({ error: "Akad sudah ditandatangani." }, { status: 409 });
    }

    const signed = await signAkadAndSync(id, "umkm", guard.id);
    if (!signed.ok) {
      return NextResponse.json(
        { error: "Gagal mencatat tanda tangan ke blockchain.", detail: signed.error },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      akadId: id,
      status: signed.status,
      blockchainStatus: signed.blockchainStatus,
      blockchainHash: signed.blockchainHash,
      contractAddress: signed.contractAddress,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
