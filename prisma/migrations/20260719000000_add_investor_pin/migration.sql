-- AlterTable
ALTER TABLE "investor_profiles"
    ADD COLUMN IF NOT EXISTS "transactionPinHash" TEXT,
    ADD COLUMN IF NOT EXISTS "pinSetAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "pinFailedAttempts" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "pinLockedUntil" TIMESTAMP(3);
