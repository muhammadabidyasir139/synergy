import { getDokuConfig } from "./config";
import { buildRequestHeaders, buildGetRequestHeaders } from "./signature";

interface DokuCallResult {
  ok: boolean;
  status: number;
  json: Record<string, unknown> | null;
  rawText: string;
}

// Below nginx's default proxy_read_timeout (60s) so a slow DOKU sandbox fails
// fast with our own JSON error instead of nginx returning a bare 502 first.
const DOKU_TIMEOUT_MS = 20_000;

async function dokuPost(path: string, body: Record<string, unknown>): Promise<DokuCallResult> {
  const { baseUrl, clientId, secretKey } = getDokuConfig();
  const rawBody = JSON.stringify(body);
  const headers = buildRequestHeaders(path, rawBody, clientId, secretKey);

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: rawBody,
    signal: AbortSignal.timeout(DOKU_TIMEOUT_MS),
  });

  const rawText = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = null;
  }

  return { ok: res.ok, status: res.status, json, rawText };
}

export interface CheckoutCustomer {
  name: string;
  email?: string;
  phone?: string;
}

export interface CreateCheckoutPaymentInput {
  invoiceNumber: string;
  amount: number;
  customer: CheckoutCustomer;
  channel: "VIRTUAL_ACCOUNT_BCA" | "VIRTUAL_ACCOUNT_BANK_MANDIRI" | "VIRTUAL_ACCOUNT_BNI" | "VIRTUAL_ACCOUNT_BRI";
  expiredTimeMinutes?: number;
}

// Per-bank Jokul Direct "Create VA" endpoints — each returns a virtual_account_number
// immediately in the response, no hosted checkout redirect required.
const VA_PATH_BY_CHANNEL: Record<CreateCheckoutPaymentInput["channel"], string> = {
  VIRTUAL_ACCOUNT_BCA: "/bca-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_BANK_MANDIRI: "/mandiri-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_BNI: "/bni-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_BRI: "/bri-virtual-account/v2/payment-code",
};

export async function createVirtualAccount(input: CreateCheckoutPaymentInput): Promise<DokuCallResult> {
  const path = VA_PATH_BY_CHANNEL[input.channel];

  const virtualAccountInfo: Record<string, unknown> = {
    billing_type: "FIX_BILL",
    expired_time: input.expiredTimeMinutes ?? 60,
    reusable_status: false,
    info1: "Synergy Investama",
    info2: "Deposit Wallet Investor",
  };
  // BNI requires a numeric dedup reference under 13 digits, unlike the other banks.
  if (input.channel === "VIRTUAL_ACCOUNT_BNI") {
    virtualAccountInfo.merchant_unique_reference = String(Date.now()).slice(-11);
  }

  const body = {
    order: {
      invoice_number: input.invoiceNumber,
      amount: input.amount,
    },
    virtual_account_info: virtualAccountInfo,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
    },
  };

  return dokuPost(path, body);
}

export interface CreateDisbursementInput {
  invoiceNumber: string;
  amount: number;
  beneficiaryName: string;
  bankCode: string;
  accountNumber: string;
  notificationUrl: string;
  description?: string;
}

export async function createDisbursement(input: CreateDisbursementInput): Promise<DokuCallResult> {
  const { disbursementPath } = getDokuConfig();

  const body = {
    disbursement: {
      invoice_number: input.invoiceNumber,
      amount: input.amount,
      description: input.description ?? "Synergy Investama Disbursement",
      callback_url: input.notificationUrl,
    },
    beneficiary: {
      name: input.beneficiaryName,
      bank_code: input.bankCode,
      account_number: input.accountNumber,
    },
  };

  return dokuPost(disbursementPath, body);
}

export async function checkOrderStatus(invoiceNumber: string): Promise<DokuCallResult> {
  const { baseUrl, clientId, secretKey } = getDokuConfig();
  const path = `/orders/v1/status/${invoiceNumber}`;
  const headers = buildGetRequestHeaders(path, clientId, secretKey);

  const res = await fetch(`${baseUrl}${path}`, { method: "GET", headers, signal: AbortSignal.timeout(DOKU_TIMEOUT_MS) });

  const rawText = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = null;
  }

  return { ok: res.ok, status: res.status, json, rawText };
}
