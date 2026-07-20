import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signAkadAndSync } from "@/lib/akad-signing";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const investorProfileId = request.headers.get("x-investor-id");
    if (!investorProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const akad = await db.akad.findUnique({
      where: { id },
      include: { investment: true },
    });

    if (!akad) return NextResponse.json({ error: "Akad not found" }, { status: 404 });
    if (akad.investment?.investorProfileId !== investorProfileId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (akad.investorSignedAt) {
      return NextResponse.json({ error: "Akad sudah ditandatangani." }, { status: 400 });
    }

    if (!akad.startDate) {
      await db.akad.update({ where: { id }, data: { startDate: new Date() } });
    }

    const signed = await signAkadAndSync(id, "investor", investorProfileId);
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
