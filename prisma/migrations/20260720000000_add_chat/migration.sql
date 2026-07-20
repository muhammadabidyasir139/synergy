-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ChatSenderRole" AS ENUM ('INVESTOR', 'UMKM');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "chat_rooms" (
    "id" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "umkmProfileId" TEXT NOT NULL,
    "campaignId" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderRole" "ChatSenderRole" NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_chat_rooms_investorProfileId" ON "chat_rooms"("investorProfileId");
CREATE INDEX IF NOT EXISTS "idx_chat_rooms_umkmProfileId" ON "chat_rooms"("umkmProfileId");
CREATE INDEX IF NOT EXISTS "idx_chat_messages_room_createdAt" ON "chat_messages"("roomId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_investorProfileId_fkey"
        FOREIGN KEY ("investorProfileId") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_umkmProfileId_fkey"
        FOREIGN KEY ("umkmProfileId") REFERENCES "umkm_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_campaignId_fkey"
        FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_roomId_fkey"
        FOREIGN KEY ("roomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
