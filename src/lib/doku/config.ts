function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name} — configure DOKU credentials before calling the payment gateway.`);
  }
  return value;
}

// True hanya jika kredensial DOKU asli sudah diisi (bukan placeholder "..." / kosong).
export function isDokuConfigured(): boolean {
  const id = process.env.DOKU_CLIENT_ID;
  const secret = process.env.DOKU_SECRET_KEY;
  const bad = (v?: string) => !v || v.trim() === "" || v.trim() === "...";
  return !bad(id) && !bad(secret);
}

export function getDokuConfig() {
  return {
    clientId: required("DOKU_CLIENT_ID"),
    secretKey: required("DOKU_SECRET_KEY"),
    baseUrl: process.env.DOKU_BASE_URL ?? "https://api-sandbox.doku.com",
    disbursementPath: process.env.DOKU_DISBURSEMENT_PATH ?? "/disbursement/v1/pay",
    appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  };
}
