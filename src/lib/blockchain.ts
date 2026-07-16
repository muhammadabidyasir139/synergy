import crypto from "crypto";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma";

export async function recordBlockchainNote(params: {
  eventType: string;
  akadId?: string;
  rawData: Prisma.InputJsonValue;
}) {
  const txHash = "0x" + crypto.randomBytes(32).toString("hex");

  return db.blockchainTransaction.create({
    data: {
      txHash,
      akadId: params.akadId,
      eventType: params.eventType,
      status: "CONFIRMED",
      timestamp: new Date(),
      rawData: params.rawData,
    },
  });
}
