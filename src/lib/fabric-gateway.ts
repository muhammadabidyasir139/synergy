// Client for the Synergy Fabric Gateway (Hyperledger Fabric blockchain).
// Endpoints match api-docs.json ("Synergy Fabric Gateway API").

const GATEWAY_TIMEOUT_MS = 8000;

interface NodeErrorLike extends Error {
  code?: string;
  errors?: unknown[];
  cause?: unknown;
}

function describeGatewayError(err: unknown, depth = 0): string {
  if (!(err instanceof Error)) return String(err);
  const e = err as NodeErrorLike;
  let out = `${e.name}: ${e.message || "(no message)"}`;
  if (e.code) out += ` [code=${e.code}]`;
  if (Array.isArray(e.errors) && e.errors.length > 0) {
    out += ` -> [${e.errors.map((sub) => describeGatewayError(sub, depth + 1)).join("; ")}]`;
  } else if (e.cause && depth < 3) {
    out += ` -> ${describeGatewayError(e.cause, depth + 1)}`;
  }
  return out;
}

function gatewayBaseUrl() {
  const raw = process.env.BLOCKCHAIN_API_URL;
  if (!raw) return null;
  // Force https on public hosts: they redirect http->https, and a 301 on a POST
  // is converted to a bodyless GET by fetch, silently dropping the payload.
  // Loopback is exempt — the gateway listens on plain http there, and going
  // through the public hostname adds a slow, flaky round trip for no benefit.
  const isLoopback = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(raw);
  const normalized = isLoopback ? raw : raw.replace(/^http:\/\//i, "https://");
  return normalized.replace(/\/+$/, "") + "/api/v1";
}

export type GatewayResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function callGateway<T = unknown>(
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: Record<string, unknown>
): Promise<GatewayResult<T>> {
  const base = gatewayBaseUrl();
  if (!base) return { ok: false, error: "BLOCKCHAIN_API_URL is not configured" };

  // Fabric gateway kadang gagal "collect enough endorsements" secara sementara
  // (transient). Retry beberapa kali dgn backoff untuk error semacam itu saja;
  // error non-transient (validasi 400, not found, dsb) langsung dikembalikan.
  const TRANSIENT = /endorse|aborted|collect enough|ECONNRESET|ETIMEDOUT|socket hang up|timeout|EAI_AGAIN/i;
  const MAX_ATTEMPTS = 4;
  let lastError = "unknown gateway error";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GATEWAY_TIMEOUT_MS);
    try {
      const res = await fetch(base + path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        lastError = `Gateway ${method} ${path} responded ${res.status}: ${text.slice(0, 300)}`;
        if (attempt < MAX_ATTEMPTS && TRANSIENT.test(text)) {
          await new Promise((r) => setTimeout(r, attempt * 1500));
          continue;
        }
        return { ok: false, error: lastError };
      }
      return { ok: true, data: data as T };
    } catch (err) {
      lastError = describeGatewayError(err);
      if (attempt < MAX_ATTEMPTS && TRANSIENT.test(lastError)) {
        await new Promise((r) => setTimeout(r, attempt * 1500));
        continue;
      }
      return { ok: false, error: lastError };
    } finally {
      clearTimeout(timeout);
    }
  }
  return { ok: false, error: lastError };
}

export interface DeployInvestmentInput {
  id: string;
  investorId: string;
  campaignId: string;
  umkmId: string;
  amount: number;
  akadType: string;
}

export interface DeployAkadInput {
  id: string;
  campaignId: string;
  investmentId: string;
  investorId: string;
  umkmId: string;
  akadType: string;
  principalAmount: number;
  nisbahInvestor: number;
  nisbahUmkm: number;
  platformFeeRate: number;
  durationMonths: number;
  startDate: string;
  endDate: string;
}

export function createInvestmentOnChain(input: DeployInvestmentInput) {
  return callGateway("/investment", "POST", { ...input });
}

export function createAkadOnChain(input: DeployAkadInput) {
  return callGateway("/akad", "POST", { ...input });
}

export function linkAkadToInvestmentOnChain(investmentId: string, akadId: string) {
  return callGateway(`/investment/${investmentId}/link-akad`, "POST", { akadId });
}

// The chaincode (AkadContract.SignAkad) matches these values verbatim and rejects
// anything else with "unknown signer type", so the casing here is load-bearing.
export type AkadSigner = "investor" | "umkm" | "admin";

export function signAkadOnChain(akadId: string, signer: AkadSigner, signerId: string) {
  return callGateway(`/akad/${akadId}/sign`, "POST", { signer, signerId });
}

export interface OnChainAkad {
  id: string;
  status: string;
  investorSignedAt: string;
  umkmSignedAt: string;
  approvedAt: string;
  approvedBy: string;
  deployedAt: string;
}

export function getAkadOnChain(akadId: string) {
  return callGateway<OnChainAkad>(`/akad/${akadId}`, "GET");
}

// Chaincode only permits PENDING -> ACTIVE | CANCELLED, then ACTIVE -> COMPLETED | DEFAULTED.
export type OnChainAkadStatus = "ACTIVE" | "CANCELLED" | "COMPLETED" | "DEFAULTED";

export function updateAkadStatusOnChain(akadId: string, status: OnChainAkadStatus, actorId: string) {
  return callGateway(`/akad/${akadId}/status`, "PATCH", { status, actorId });
}
