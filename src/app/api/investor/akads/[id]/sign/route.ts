import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AkadStatus } from "@/generated/prisma";
import crypto from "crypto";

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

    const blockchainHash = "0x" + crypto.randomBytes(20).toString("hex");
    const contractAddress = "0x" + crypto.randomBytes(20).toString("hex");

    const updated = await db.akad.update({
      where: { id },
      data: {
        investorSignedAt: new Date(),
        status: AkadStatus.ACTIVE,
        blockchainHash,
        contractAddress,
        blockchainStatus: "CONFIRMED",
        deployedAt: new Date(),
        startDate: akad.startDate ?? new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      akadId: updated.id,
      blockchainHash: updated.blockchainHash,
      contractAddress: updated.contractAddress,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
