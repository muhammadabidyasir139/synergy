import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://wilayah.id/api/provinces.json", {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[WILAYAH_PROVINCES]", err);
    return NextResponse.json({ error: "Gagal memuat data provinsi." }, { status: 502 });
  }
}
