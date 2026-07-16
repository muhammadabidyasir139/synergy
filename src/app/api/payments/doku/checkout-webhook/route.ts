import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDokuConfig } from "@/lib/doku/config";
import { verifyIncomingSignature } from "@/lib/doku/signature";
import { finalizeDokuPayment } from "@/lib/doku/payments";
import { Prisma } from "@/generated/prisma";

const REQUEST_TARGET = "/api/payments/doku/checkout-webhook";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let secretKey: string;
  try {
    secretKey = getDokuConfig().secretKey;
  } catch (err) {
    console.error("[DOKU checkout-webhook] not configured", err);
    return NextResponse.json({ error: "Gateway not configured" }, { status: 503 });
  }

  const valid = verifyIncomingSignature(
    {
      clientId: request.headers.get("Client-Id"),
      requestId: request.headers.get("Request-Id"),
      timestamp: request.headers.get("Request-Timestamp"),
      signature: request.headers.get("Signature"),
      digest: request.headers.get("Digest"),
    },
    REQUEST_TARGET,
    rawBody,
    secretKey
  );
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, any>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const invoiceNumber: string | undefined = body?.order?.invoice_number;
  const dokuStatus: string | undefined = body?.transaction?.status;
  if (!invoiceNumber) {
    return NextResponse.json({ error: "Missing invoice_number" }, { status: 400 });
  }

  const dokuPayment = await db.dokuPayment.findUnique({ where: { invoiceNumber } });
  if (!dokuPayment) {
    return NextResponse.json({ error: "Unknown invoice" }, { status: 404 });
  }

  const status = dokuStatus === "SUCCESS" ? "PAID" : dokuStatus === "EXPIRED" ? "EXPIRED" : "FAILED";
  await finalizeDokuPayment(dokuPayment.id, status, body as Prisma.InputJsonValue);

  return NextResponse.json({ success: true });
}
