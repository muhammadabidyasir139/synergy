import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ChatSenderRole } from "@/generated/prisma";

export interface ChatParticipant {
  role: ChatSenderRole;
  /** InvestorProfile.id atau UmkmProfile.id, tergantung role. */
  profileId: string;
  userId: string;
}

/**
 * Mengembalikan identitas peserta chat dari sesi aktif.
 * Admin bukan peserta negosiasi, jadi sengaja tidak didukung.
 */
export async function getChatParticipant(request?: Request): Promise<ChatParticipant | null> {
  let requestedRole: string | undefined = undefined;
  if (request) {
    const url = new URL(request.url);
    const roleOverride = url.searchParams.get("role");
    if (roleOverride === "INVESTOR" || roleOverride === "UMKM") {
      requestedRole = roleOverride;
    }
  }

  const session = await getSession(requestedRole);
  if (!session) return null;

  const activeRole = requestedRole || session.role;

  if (activeRole === "INVESTOR") {
    const profile = await db.investorProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    return profile
      ? { role: ChatSenderRole.INVESTOR, profileId: profile.id, userId: session.userId }
      : null;
  }

  if (activeRole === "UMKM") {
    const profile = await db.umkmProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    return profile
      ? { role: ChatSenderRole.UMKM, profileId: profile.id, userId: session.userId }
      : null;
  }

  return null;
}

/** Filter Prisma yang membatasi room hanya milik peserta ini. */
export function roomScopeFor(participant: ChatParticipant) {
  return participant.role === ChatSenderRole.INVESTOR
    ? { investorProfileId: participant.profileId }
    : { umkmProfileId: participant.profileId };
}

/** Memastikan room memang milik peserta; null bila tidak berhak. */
export async function findRoomForParticipant(roomId: string, participant: ChatParticipant) {
  return db.chatRoom.findFirst({
    where: { id: roomId, ...roomScopeFor(participant) },
  });
}

/** Lawan bicara dari sudut pandang peserta. */
export function counterpartRole(role: ChatSenderRole): ChatSenderRole {
  return role === ChatSenderRole.INVESTOR ? ChatSenderRole.UMKM : ChatSenderRole.INVESTOR;
}
