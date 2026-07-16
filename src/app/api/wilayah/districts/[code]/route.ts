import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!/^\d+(\.\d+)*$/.test(code)) {
    return NextResponse.json({ error: "Kode kota/kabupaten tidak valid." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://wilayah.id/api/districts/${code}.json`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[WILAYAH_DISTRICTS]", err);
    return NextResponse.json({ error: "Gagal memuat data kecamatan." }, { status: 502 });
  }
}
