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
  // Force https: the gateway host redirects http->https, and a 301 on a POST
  // is converted to a bodyless GET by fetch, silently dropping the payload.
  const httpsUrl = raw.replace(/^http:\/\//i, "https://");
  return httpsUrl.replace(/\/+$/, "") + "/api/v1";
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
      return { ok: false, error: `Gateway ${method} ${path} responded ${res.status}: ${text.slice(0, 300)}` };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    return { ok: false, error: describeGatewayError(err) };
  } finally {
    clearTimeout(timeout);
  }
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

export function signAkadOnChain(akadId: string, signer: string, signerId: string) {
  return callGateway(`/akad/${akadId}/sign`, "POST", { signer, signerId });
}
