function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name} — configure DOKU credentials before calling the payment gateway.`);
  }
  return value;
}

export function getDokuConfig() {
  return {
    clientId: required("DOKU_CLIENT_ID"),
    secretKey: required("DOKU_SECRET_KEY"),
    baseUrl: process.env.DOKU_BASE_URL ?? "https://api-sandbox.doku.com",
    checkoutPath: process.env.DOKU_CHECKOUT_PATH ?? "/checkout/v1/payment",
    disbursementPath: process.env.DOKU_DISBURSEMENT_PATH ?? "/disbursement/v1/pay",
    appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  };
}
