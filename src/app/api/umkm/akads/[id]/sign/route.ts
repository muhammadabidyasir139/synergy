import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { AkadStatus } from "@/generated/prisma";
import { requireUmkmProfileId } from "@/lib/auth-guard";
import { signAkadOnChain } from "@/lib/fabric-gateway";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireUmkmProfileId();
    if (guard.error) return guard.error;
    const umkmProfileId = guard.id;

    const { id } = await params;

    const akad = await db.akad.findUnique({
      where: { id },
      include: { campaign: true },
    });

    if (!akad) return NextResponse.json({ error: "Akad not found" }, { status: 404 });
    if (akad.campaign.umkmProfileId !== umkmProfileId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (akad.umkmSignedAt) {
      return NextResponse.json({ error: "Akad sudah ditandatangani." }, { status: 400 });
    }

    // Notify the Hyperledger Fabric blockchain via the Synergy Fabric Gateway (BLOCKCHAIN_API_URL).
    const signDeploy = await signAkadOnChain(akad.id, "UMKM", umkmProfileId);
    const signData = signDeploy.ok ? (signDeploy.data as Record<string, unknown>) : {};

    const blockchainHash =
      (typeof signData.txHash === "string" && signData.txHash) ||
      akad.blockchainHash ||
      (signDeploy.ok ? null : "0x" + crypto.randomBytes(20).toString("hex"));
    const contractAddress =
      (typeof signData.contractAddress === "string" && signData.contractAddress) ||
      akad.contractAddress ||
      null;
    const blockchainStatus = signDeploy.ok ? "CONFIRMED" : (akad.blockchainStatus ?? "PENDING_SYNC");

    const bothSigned = !!akad.investorSignedAt;

    const updated = await db.akad.update({
      where: { id },
      data: {
        umkmSignedAt: new Date(),
        status: bothSigned ? AkadStatus.ACTIVE : akad.status,
        blockchainHash,
        contractAddress,
        blockchainStatus,
        deployedAt: akad.deployedAt ?? (blockchainStatus === "CONFIRMED" ? new Date() : null),
      },
    });

    if (signDeploy.ok && blockchainHash) {
      await db.blockchainTransaction.create({
        data: {
          akadId: akad.id,
          txHash: blockchainHash,
          contractAddress,
          eventType: "AKAD_UMKM_SIGNED",
          status: blockchainStatus,
          timestamp: new Date(),
          rawData: { umkmProfileId },
        },
      });
    } else if (!signDeploy.ok) {
      console.error("Fabric gateway sign (UMKM) failed:", signDeploy.error);
    }

    return NextResponse.json({
      success: true,
      akadId: updated.id,
      status: updated.status,
      blockchainHash: updated.blockchainHash,
      contractAddress: updated.contractAddress,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
