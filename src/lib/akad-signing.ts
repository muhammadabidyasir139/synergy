// Shared helper for recording an akad signature on the Hyperledger Fabric ledger
// and reconciling our database with whatever the chain actually reports back.
//
// The ledger is the source of truth: an akad only becomes ACTIVE once the
// chaincode has collected all three signatures (investor + umkm + admin).

import { db } from "@/lib/db";
import { AkadStatus } from "@/generated/prisma";
import { signAkadOnChain, getAkadOnChain, type AkadSigner } from "@/lib/fabric-gateway";

function parseChainDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type SignAkadResult =
  | { ok: true; status: AkadStatus; blockchainStatus: string; onChain: Record<string, unknown> }
  | { ok: false; error: string };

/**
 * Signs an akad on-chain as `signer`, then mirrors the resulting ledger state
 * into the akad row. Returns an error without touching the database if the
 * chaincode rejects the signature, so we never report a signature we don't have.
 */
export async function signAkadAndSync(
  akadId: string,
  signer: AkadSigner,
  signerId: string
): Promise<SignAkadResult> {
  const signed = await signAkadOnChain(akadId, signer, signerId);
  if (!signed.ok) {
    console.error(`Fabric sign failed (akad=${akadId}, signer=${signer}):`, signed.error);
    return { ok: false, error: signed.error };
  }

  // Read back the ledger rather than assuming what the signature did.
  const chain = await getAkadOnChain(akadId);
  if (!chain.ok) {
    console.error(`Fabric read-back failed (akad=${akadId}):`, chain.error);
    return { ok: false, error: chain.error };
  }

  const onChain = chain.data;
  const isActive = onChain.status === "ACTIVE";
  const blockchainStatus = isActive ? "CONFIRMED" : "SUBMITTED";

  await db.akad.update({
    where: { id: akadId },
    data: {
      investorSignedAt: parseChainDate(onChain.investorSignedAt),
      umkmSignedAt: parseChainDate(onChain.umkmSignedAt),
      approvedAt: parseChainDate(onChain.approvedAt),
      approvedBy: onChain.approvedBy || null,
      deployedAt: parseChainDate(onChain.deployedAt),
      blockchainStatus,
      status: isActive ? AkadStatus.ACTIVE : undefined,
    },
  });

  await db.blockchainTransaction.create({
    data: {
      akadId,
      // The gateway does not surface Fabric transaction IDs on submit, so this
      // column stays synthetic until it does. Do not treat it as a ledger proof.
      txHash: `sign-${signer}-${akadId}-${Date.now()}`,
      eventType: isActive ? "AKAD_ACTIVATED" : "AKAD_SIGNED",
      status: blockchainStatus,
      timestamp: new Date(),
      rawData: { signer, signerId, onChainStatus: onChain.status },
    },
  });

  return {
    ok: true,
    status: isActive ? AkadStatus.ACTIVE : AkadStatus.PENDING,
    blockchainStatus,
    onChain: onChain as unknown as Record<string, unknown>,
  };
}
