import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action, reason } = body as {
    action: "flag" | "unflag" | "block";
    reason?: string;
  };

  const updated = await db.transaction.update({
    where: { id },
    data: {
      isFlagged: action !== "unflag",
      flagReason: action !== "unflag" ? reason : null,
      status: action === "block" ? "BLOCKED" : action === "flag" ? "FLAGGED" : "COMPLETED",
    },
  });

  return Response.json({ success: true, status: updated.status });
}
