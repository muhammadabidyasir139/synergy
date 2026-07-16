import { db } from "@/lib/db";
import { DokuDirection, DokuPaymentStatus, TransactionStatus, TransactionType, Prisma } from "@/generated/prisma";
import { getDokuConfig } from "./config";
import { createCheckoutPayment, createDisbursement, CheckoutCustomer, CreateCheckoutPaymentInput } from "./client";
import { recordBlockchainNote } from "@/lib/blockchain";

export interface InitiateInboundPaymentParams {
  walletId: string;
  amount: number;
  description: string;
  customer: CheckoutCustomer;
  channel: CreateCheckoutPaymentInput["channel"];
  invoicePrefix: string;
}

export interface InitiateInboundPaymentResult {
  success: boolean;
  error?: string;
  transactionId: string;
  invoiceNumber: string;
  paymentUrl: string | null;
  virtualAccountNumber: string | null;
  expiredAt: string | null;
}

export async function initiateInboundPayment(params: InitiateInboundPaymentParams): Promise<InitiateInboundPaymentResult> {
  const wallet = await db.wallet.findUniqueOrThrow({ where: { id: params.walletId } });

  const { transaction, dokuPayment } = await db.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        walletId: params.walletId,
        type: TransactionType.DEPOSIT,
        amount: params.amount,
        balanceBefore: Number(wallet.balance),
        balanceAfter: Number(wallet.balance),
        status: TransactionStatus.PENDING,
        description: params.description,
      },
    });

    const dokuPayment = await tx.dokuPayment.create({
      data: {
        transactionId: transaction.id,
        direction: DokuDirection.INBOUND,
        invoiceNumber: `${params.invoicePrefix}-${transaction.id}`,
        channel: params.channel,
        status: DokuPaymentStatus.PENDING,
        amount: params.amount,
      },
    });

    return { transaction, dokuPayment };
  });

  const notificationUrl = `${getDokuConfig().appBaseUrl}/api/payments/doku/checkout-webhook`;

  const result = await createCheckoutPayment({
    invoiceNumber: dokuPayment.invoiceNumber,
    amount: params.amount,
    customer: params.customer,
    channel: params.channel,
    notificationUrl,
  });

  const responseBody = result.json as Record<string, any> | null;
  const paymentUrl: string | null = responseBody?.payment?.url ?? null;
  const virtualAccountNumber: string | null =
    responseBody?.virtual_account_info?.virtual_account_number ??
    responseBody?.virtual_account_parameter?.virtual_account_number ??
    null;
  const dokuRequestId: string | null = responseBody?.request_id ?? responseBody?.order?.session_id ?? null;
  const expiredAt: Date | null = responseBody?.virtual_account_info?.expired_date
    ? new Date(responseBody.virtual_account_info.expired_date)
    : null;

  if (!result.ok) {
    await db.$transaction([
      db.dokuPayment.update({
        where: { id: dokuPayment.id },
        data: { status: DokuPaymentStatus.FAILED, rawRequest: params as unknown as Prisma.InputJsonValue, rawResponse: (responseBody ?? { rawText: result.rawText }) as Prisma.InputJsonValue },
      }),
      db.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED, processedAt: new Date() },
      }),
    ]);

    return {
      success: false,
      error: "Gagal membuat tagihan pembayaran DOKU.",
      transactionId: transaction.id,
      invoiceNumber: dokuPayment.invoiceNumber,
      paymentUrl: null,
      virtualAccountNumber: null,
      expiredAt: null,
    };
  }

  await db.dokuPayment.update({
    where: { id: dokuPayment.id },
    data: {
      dokuRequestId,
      paymentUrl,
      virtualAccountNo: virtualAccountNumber,
      expiredAt,
      rawResponse: (responseBody ?? { rawText: result.rawText }) as Prisma.InputJsonValue,
    },
  });

  return {
    success: true,
    transactionId: transaction.id,
    invoiceNumber: dokuPayment.invoiceNumber,
    paymentUrl,
    virtualAccountNumber,
    expiredAt: expiredAt ? expiredAt.toISOString() : null,
  };
}

export interface OutboundDestination {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface InitiateOutboundPaymentParams {
  walletId: string;
  amount: number;
  type: typeof TransactionType.WITHDRAWAL | typeof TransactionType.PROFIT_SHARING | typeof TransactionType.DISBURSEMENT;
  description: string;
  destination: OutboundDestination;
  invoicePrefix: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  /** Balance already applied to the wallet at creation time (e.g. withdrawal debit). */
  balanceBefore: number;
  balanceAfter: number;
}

export interface InitiateOutboundPaymentResult {
  success: boolean;
  error?: string;
  transactionId: string;
  invoiceNumber: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
}

export async function initiateOutboundPayment(params: InitiateOutboundPaymentParams): Promise<InitiateOutboundPaymentResult> {
  const { transaction, dokuPayment } = await db.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        walletId: params.walletId,
        type: params.type,
        amount: params.amount,
        balanceBefore: params.balanceBefore,
        balanceAfter: params.balanceAfter,
        status: TransactionStatus.PROCESSING,
        description: params.description,
        relatedEntityId: params.relatedEntityId,
        relatedEntityType: params.relatedEntityType,
      },
    });

    const dokuPayment = await tx.dokuPayment.create({
      data: {
        transactionId: transaction.id,
        direction: DokuDirection.OUTBOUND,
        invoiceNumber: `${params.invoicePrefix}-${transaction.id}`,
        status: DokuPaymentStatus.PENDING,
        amount: params.amount,
        destinationBank: params.destination.bankCode,
        destinationAccountNumber: params.destination.accountNumber,
        destinationAccountName: params.destination.accountName,
      },
    });

    return { transaction, dokuPayment };
  });

  const notificationUrl = `${getDokuConfig().appBaseUrl}/api/payments/doku/disbursement-webhook`;

  const result = await createDisbursement({
    invoiceNumber: dokuPayment.invoiceNumber,
    amount: params.amount,
    beneficiaryName: params.destination.accountName,
    bankCode: params.destination.bankCode,
    accountNumber: params.destination.accountNumber,
    notificationUrl,
    description: params.description,
  });

  const responseBody = result.json as Record<string, any> | null;

  if (!result.ok) {
    await finalizeDokuPayment(dokuPayment.id, "FAILED", (responseBody ?? { rawText: result.rawText }) as Prisma.InputJsonValue);
    return { success: false, error: "Gagal memproses pencairan dana DOKU.", transactionId: transaction.id, invoiceNumber: dokuPayment.invoiceNumber, status: "FAILED" };
  }

  await db.dokuPayment.update({
    where: { id: dokuPayment.id },
    data: {
      dokuRequestId: responseBody?.request_id ?? null,
      rawResponse: (responseBody ?? { rawText: result.rawText }) as Prisma.InputJsonValue,
    },
  });

  const dokuStatus: string | undefined = responseBody?.disbursement?.status ?? responseBody?.transaction?.status;
  if (dokuStatus === "SUCCESS" || dokuStatus === "COMPLETED") {
    await finalizeDokuPayment(dokuPayment.id, "PAID", responseBody as Prisma.InputJsonValue);
    return { success: true, transactionId: transaction.id, invoiceNumber: dokuPayment.invoiceNumber, status: "COMPLETED" };
  }
  if (dokuStatus === "FAILED" || dokuStatus === "REJECTED") {
    await finalizeDokuPayment(dokuPayment.id, "FAILED", responseBody as Prisma.InputJsonValue);
    return { success: false, error: "Pencairan dana ditolak oleh DOKU.", transactionId: transaction.id, invoiceNumber: dokuPayment.invoiceNumber, status: "FAILED" };
  }

  return { success: true, transactionId: transaction.id, invoiceNumber: dokuPayment.invoiceNumber, status: "PROCESSING" };
}

export async function finalizeDokuPayment(
  dokuPaymentId: string,
  dokuStatus: "PAID" | "FAILED" | "EXPIRED",
  rawCallback: Prisma.InputJsonValue
): Promise<{ handled: boolean }> {
  const dokuPayment = await db.dokuPayment.findUnique({
    where: { id: dokuPaymentId },
    include: { transaction: { include: { wallet: true } } },
  });
  if (!dokuPayment) return { handled: false };

  if (dokuPayment.status === "PAID" || dokuPayment.status === "FAILED" || dokuPayment.status === "EXPIRED") {
    return { handled: false };
  }

  const { transaction } = dokuPayment;
  const wallet = transaction.wallet;
  const success = dokuStatus === "PAID";

  await db.$transaction(async (tx) => {
    await tx.dokuPayment.update({
      where: { id: dokuPaymentId },
      data: { status: dokuStatus, paidAt: success ? new Date() : null, rawCallback },
    });

    if (transaction.type === TransactionType.DEPOSIT) {
      if (success) {
        const updated = await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: Number(transaction.amount) } },
        });
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.COMPLETED,
            balanceBefore: Number(wallet.balance),
            balanceAfter: Number(updated.balance),
            processedAt: new Date(),
          },
        });
      } else {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.FAILED, processedAt: new Date() },
        });
      }
      return;
    }

    if (transaction.type === TransactionType.WITHDRAWAL) {
      if (success) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.COMPLETED, processedAt: new Date() },
        });
      } else {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: Number(transaction.amount) } },
        });
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.FAILED, processedAt: new Date() },
        });
      }
      return;
    }

    if (transaction.type === TransactionType.PROFIT_SHARING) {
      if (success && transaction.relatedEntityId) {
        await tx.profitSharing.update({
          where: { id: transaction.relatedEntityId },
          data: { status: "PAID", paidAt: new Date() },
        });
      }
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: success ? TransactionStatus.COMPLETED : TransactionStatus.FAILED, processedAt: new Date() },
      });
      return;
    }

    if (transaction.type === TransactionType.DISBURSEMENT) {
      if (success && transaction.relatedEntityId) {
        const akad = await tx.akad.findUnique({
          where: { id: transaction.relatedEntityId },
          include: { investment: { include: { investorProfile: { include: { user: { include: { wallet: true } } } } } } },
        });
        const investorWallet = akad?.investment?.investorProfile.user.wallet;
        if (investorWallet) {
          await tx.wallet.update({
            where: { id: investorWallet.id },
            data: {
              balance: { decrement: Number(akad!.principalAmount) },
              lockedBalance: { decrement: Number(akad!.principalAmount) },
            },
          });
        }
      }
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: success ? TransactionStatus.COMPLETED : TransactionStatus.FAILED, processedAt: new Date() },
      });
      return;
    }
  });

  if (success) {
    const eventType =
      transaction.type === TransactionType.DEPOSIT
        ? "DOKU_DEPOSIT_CONFIRMED"
        : transaction.type === TransactionType.WITHDRAWAL
        ? "DOKU_WITHDRAWAL_DISBURSED"
        : transaction.type === TransactionType.PROFIT_SHARING
        ? "DOKU_PROFIT_SHARING_PAID"
        : "DOKU_UMKM_DISBURSEMENT_CONFIRMED";

    let akadId: string | undefined;
    if (transaction.type === TransactionType.PROFIT_SHARING && transaction.relatedEntityId) {
      const profitSharing = await db.profitSharing.findUnique({ where: { id: transaction.relatedEntityId }, select: { akadId: true } });
      akadId = profitSharing?.akadId;
    } else if (transaction.type === TransactionType.DISBURSEMENT && transaction.relatedEntityId) {
      akadId = transaction.relatedEntityId;
    }

    await recordBlockchainNote({
      eventType,
      akadId,
      rawData: {
        transactionId: transaction.id,
        invoiceNumber: dokuPayment.invoiceNumber,
        amount: Number(transaction.amount),
        direction: dokuPayment.direction,
      },
    });
  }

  return { handled: true };
}
