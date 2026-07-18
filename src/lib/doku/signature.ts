import crypto from "crypto";

export interface DokuSignedHeaders {
  "Client-Id": string;
  "Request-Id": string;
  "Request-Timestamp": string;
  Signature: string;
  Digest: string;
}

function computeDigest(rawBody: string): string {
  return crypto.createHash("sha256").update(rawBody, "utf8").digest("base64");
}

function buildSignatureComponent(params: {
  clientId: string;
  requestId: string;
  timestamp: string;
  requestTarget: string;
  digest: string;
}): string {
  return [
    `Client-Id:${params.clientId}`,
    `Request-Id:${params.requestId}`,
    `Request-Timestamp:${params.timestamp}`,
    `Request-Target:${params.requestTarget}`,
    `Digest:${params.digest}`,
  ].join("\n");
}

export function buildRequestHeaders(
  requestTarget: string,
  rawBody: string,
  clientId: string,
  secretKey: string
): DokuSignedHeaders {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const digest = computeDigest(rawBody);
  const component = buildSignatureComponent({ clientId, requestId, timestamp, requestTarget, digest });
  const signature = "HMACSHA256=" + crypto.createHmac("sha256", secretKey).update(component, "utf8").digest("base64");

  return {
    "Client-Id": clientId,
    "Request-Id": requestId,
    "Request-Timestamp": timestamp,
    Signature: signature,
    Digest: digest,
  };
}

export function buildGetRequestHeaders(
  requestTarget: string,
  clientId: string,
  secretKey: string
): Omit<DokuSignedHeaders, "Digest"> {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const component = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${timestamp}`,
    `Request-Target:${requestTarget}`,
  ].join("\n");
  const signature = "HMACSHA256=" + crypto.createHmac("sha256", secretKey).update(component, "utf8").digest("base64");

  return {
    "Client-Id": clientId,
    "Request-Id": requestId,
    "Request-Timestamp": timestamp,
    Signature: signature,
  };
}

export function verifyIncomingSignature(
  headers: { clientId: string | null; requestId: string | null; timestamp: string | null; signature: string | null; digest: string | null },
  requestTarget: string,
  rawBody: string,
  secretKey: string
): boolean {
  const { clientId, requestId, timestamp, signature, digest } = headers;
  if (!clientId || !requestId || !timestamp || !signature || !digest) return false;

  const expectedDigest = computeDigest(rawBody);
  if (!timingSafeEqualStr(digest, expectedDigest)) return false;

  const component = buildSignatureComponent({ clientId, requestId, timestamp, requestTarget, digest });
  const expectedSignature =
    "HMACSHA256=" + crypto.createHmac("sha256", secretKey).update(component, "utf8").digest("base64");

  return timingSafeEqualStr(signature, expectedSignature);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
