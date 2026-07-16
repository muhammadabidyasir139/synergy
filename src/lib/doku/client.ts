import { getDokuConfig } from "./config";
import { buildRequestHeaders } from "./signature";

interface DokuCallResult {
  ok: boolean;
  status: number;
  json: Record<string, unknown> | null;
  rawText: string;
}

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
  channel: "VIRTUAL_ACCOUNT_BCA" | "VIRTUAL_ACCOUNT_MANDIRI" | "VIRTUAL_ACCOUNT_BNI" | "VIRTUAL_ACCOUNT_BRI";
  notificationUrl: string;
  expiredTimeMinutes?: number;
}

const VA_BANK_BY_CHANNEL: Record<CreateCheckoutPaymentInput["channel"], string> = {
  VIRTUAL_ACCOUNT_BCA: "BCA",
  VIRTUAL_ACCOUNT_MANDIRI: "MANDIRI",
  VIRTUAL_ACCOUNT_BNI: "BNI",
  VIRTUAL_ACCOUNT_BRI: "BRI",
};

export async function createCheckoutPayment(input: CreateCheckoutPaymentInput): Promise<DokuCallResult> {
  const { checkoutPath } = getDokuConfig();

  const body = {
    order: {
      invoice_number: input.invoiceNumber,
      amount: input.amount,
      callback_url: input.notificationUrl,
    },
    virtual_account_info: {
      billing_type: "FIX_BILL",
      expired_time: input.expiredTimeMinutes ?? 60,
      reusable_status: false,
      bank: VA_BANK_BY_CHANNEL[input.channel],
      info1: "Synergy Investama",
      info2: "Deposit Wallet Investor",
    },
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
    },
  };

  return dokuPost(checkoutPath, body);
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
