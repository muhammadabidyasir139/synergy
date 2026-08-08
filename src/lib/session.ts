import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const DEV_FALLBACK_SECRET = "synergy-dev-secret-change-in-production";

let cachedSecret: Uint8Array | null = null;

/**
 * Kunci penandatangan sesi.
 *
 * Sebelumnya nilai ini diam-diam jatuh ke konstanta di atas bila
 * SESSION_SECRET tidak diset, sehingga produksi menandatangani cookie dengan
 * secret yang tertulis di source code — siapa pun yang membaca repo bisa
 * memalsukan sesi user mana pun. Di produksi sekarang wajib diisi.
 *
 * Diambil secara lazy (bukan saat modul dimuat) agar `next build` tidak gagal
 * di lingkungan yang memang belum punya env ini.
 */
function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;

  const fromEnv = process.env.SESSION_SECRET;
  if (!fromEnv) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET wajib diisi di produksi. Isi dengan nilai acak minimal 32 byte, mis. `openssl rand -base64 48`."
      );
    }
    console.warn("[session] SESSION_SECRET belum diset — memakai secret dev. Jangan dipakai di produksi.");
    cachedSecret = new TextEncoder().encode(DEV_FALLBACK_SECRET);
    return cachedSecret;
  }

  cachedSecret = new TextEncoder().encode(fromEnv);
  return cachedSecret;
}

const COOKIE = "synergy_session";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

import { JWTPayload } from "jose";

export interface SessionPayload extends JWTPayload {
  userId: string;
  role: "INVESTOR" | "UMKM" | "ADMIN";
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(role?: string): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  let token = undefined;
  
  // Jika role spesifik diminta, prioritaskan mencari cookie khusus role tersebut terlebih dahulu
  if (role) {
    token = cookieStore.get(`${COOKIE}_${role.toLowerCase()}`)?.value;
  }
  
  // Fallback ke cookie global jika tidak ada cookie khusus role
  if (!token) {
    token = cookieStore.get(COOKIE)?.value;
  }
  
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookieOptions(token: string, role?: string) {
  return {
    name: role ? `${COOKIE}_${role.toLowerCase()}` : COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}
