-- CreateTable
CREATE TABLE IF NOT EXISTS `chat_rooms` (
    `id` VARCHAR(191) NOT NULL,
    `investorProfileId` VARCHAR(191) NOT NULL,
    `umkmProfileId` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `lastMessageAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `idx_chat_rooms_investorProfileId` (`investorProfileId`),
    INDEX `idx_chat_rooms_umkmProfileId` (`umkmProfileId`),
    CONSTRAINT `chat_rooms_investorProfileId_fkey` FOREIGN KEY (`investorProfileId`) REFERENCES `investor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chat_rooms_umkmProfileId_fkey` FOREIGN KEY (`umkmProfileId`) REFERENCES `umkm_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chat_rooms_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `chat_messages` (
    `id` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `senderRole` ENUM('INVESTOR', 'UMKM') NOT NULL,
    `content` TEXT NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    INDEX `idx_chat_messages_room_createdAt` (`roomId`, `createdAt`),
    CONSTRAINT `chat_messages_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `chat_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
