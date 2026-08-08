import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action, reason } = body as {
    action: "suspend" | "ban" | "reactivate";
    reason?: string;
  };

  const statusMap = {
    suspend: "SUSPENDED",
    ban: "BANNED",
    reactivate: "ACTIVE",
  } as const;

  const newStatus = statusMap[action];

  await db.user.update({
    where: { id },
    data: { status: newStatus },
  });

  await db.auditLog.create({
    data: {
      action: `USER_${action.toUpperCase()}`,
      entityType: "User",
      entityId: id,
      newData: { status: newStatus, reason },
    },
  });

  return Response.json({ success: true, status: newStatus });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, email, phoneNumber, password, role, status, kycStatus } = body;

  const existingUser = await db.user.findUnique({
    where: { id },
    include: { umkmProfile: true, investorProfile: true },
  });

  if (!existingUser) {
    return Response.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  await db.user.update({
    where: { id },
    data: {
      email: email !== undefined ? email : existingUser.email,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : existingUser.phoneNumber,
      ...(password ? { passwordHash: `hashed_${password}` } : {}),
      status: status || existingUser.status,
      kycStatus: kycStatus || existingUser.kycStatus,
    },
  });

  if (existingUser.role === "UMKM" && existingUser.umkmProfile) {
    await db.umkmProfile.update({
      where: { userId: id },
      data: { businessName: name || existingUser.umkmProfile.businessName },
    });
  } else if (existingUser.role === "INVESTOR" && existingUser.investorProfile) {
    await db.investorProfile.update({
      where: { userId: id },
      data: { fullName: name || existingUser.investorProfile.fullName },
    });
  }

  await db.auditLog.create({
    data: {
      action: "ADMIN_UPDATE_USER",
      entityType: "User",
      entityId: id,
      newData: { name, email, phoneNumber, status, kycStatus },
    },
  });

  return Response.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return Response.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    if (existingUser.role === "ADMIN") {
      return Response.json({ error: "Tidak dapat menghapus akun Administrator." }, { status: 400 });
    }

    await db.user.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        action: "ADMIN_DELETE_USER",
        entityType: "User",
        entityId: id,
        oldData: { role: existingUser.role, email: existingUser.email },
      },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message || "Gagal menghapus pengguna." }, { status: 500 });
  }
}
