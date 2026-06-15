import { db } from "@/lib/db";
import { NextRequest } from "next/server";

const DEFAULT_CONFIGS = [
  { key: "nisbah_mudharabah", value: "60", description: "Nisbah Mudharabah (Investor) %" },
  { key: "nisbah_musyarakah", value: "50", description: "Nisbah Musyarakah (Investor) %" },
  { key: "platform_fee", value: "2.5", description: "Platform Fee %" },
  { key: "ai_threshold_low", value: "30", description: "AI Threshold – Low Risk score" },
  { key: "ai_threshold_medium", value: "60", description: "AI Threshold – Medium Risk score" },
  { key: "ai_threshold_high", value: "80", description: "AI Threshold – High Risk score" },
  { key: "max_funding_days", value: "90", description: "Maks Hari Pendanaan" },
  { key: "min_investment", value: "100000", description: "Min Investasi (Rp)" },
];

export async function GET() {
  // Seed defaults if not present
  for (const cfg of DEFAULT_CONFIGS) {
    await db.systemConfig.upsert({
      where: { key: cfg.key },
      create: cfg,
      update: {},
    });
  }

  const configs = await db.systemConfig.findMany({
    orderBy: { key: "asc" },
  });

  return Response.json(configs);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const updates = body as { key: string; value: string }[];

  await Promise.all(
    updates.map((u) =>
      db.systemConfig.upsert({
        where: { key: u.key },
        create: { key: u.key, value: u.value },
        update: { value: u.value, updatedAt: new Date() },
      })
    )
  );

  return Response.json({ success: true, updated: updates.length });
}
