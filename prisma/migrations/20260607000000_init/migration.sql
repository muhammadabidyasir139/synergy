-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'INVESTOR', 'UMKM') NOT NULL,
    `status` ENUM('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BANNED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    `kycStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `isPhoneVerified` BOOLEAN NOT NULL DEFAULT false,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `isSuperAdmin` BOOLEAN NOT NULL DEFAULT false,
    `department` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `investor_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `province` VARCHAR(191) NULL,
    `investmentGoal` VARCHAR(191) NULL,
    `riskTolerance` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    `totalInvested` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `totalProfit` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `investor_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `umkm_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ownerName` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NOT NULL,
    `businessCategory` VARCHAR(191) NOT NULL,
    `businessDescription` TEXT NULL,
    `location` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `province` VARCHAR(191) NULL,
    `establishedDate` DATETIME(3) NULL,
    `employeeCount` INTEGER NULL,
    `monthlyRevenue` DECIMAL(18, 2) NULL,
    `website` VARCHAR(191) NULL,
    `socialMedia` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `umkm_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kyc_documents` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(191) NOT NULL,
    `documentUrl` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `rejectReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_scores` (
    `id` VARCHAR(191) NOT NULL,
    `umkmProfileId` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `riskLevel` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    `modelVersion` VARCHAR(191) NOT NULL DEFAULT '1.0',
    `features` JSON NOT NULL,
    `insights` JSON NULL,
    `recommendations` JSON NULL,
    `triggeredBy` VARCHAR(191) NULL,
    `predictedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_data` (
    `id` VARCHAR(191) NOT NULL,
    `umkmProfileId` VARCHAR(191) NOT NULL,
    `reportDate` DATETIME(3) NOT NULL,
    `dailyRevenue` DECIMAL(18, 2) NULL,
    `dailyExpense` DECIMAL(18, 2) NULL,
    `monthlyRevenue` DECIMAL(18, 2) NULL,
    `monthlyExpense` DECIMAL(18, 2) NULL,
    `dataSource` VARCHAR(191) NOT NULL DEFAULT 'MANUAL',
    `rawData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `funding_applications` (
    `id` VARCHAR(191) NOT NULL,
    `umkmProfileId` VARCHAR(191) NOT NULL,
    `akadType` ENUM('MUSYARAKAH', 'MURABAHAH') NOT NULL,
    `requestedAmount` DECIMAL(18, 2) NOT NULL,
    `durationMonths` INTEGER NOT NULL,
    `purpose` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `rejectReason` TEXT NULL,
    `creditScoreId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaigns` (
    `id` VARCHAR(191) NOT NULL,
    `umkmProfileId` VARCHAR(191) NOT NULL,
    `fundingApplicationId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `story` TEXT NOT NULL,
    `targetAmount` DECIMAL(18, 2) NOT NULL,
    `collectedAmount` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `akadType` ENUM('MUSYARAKAH', 'MURABAHAH') NOT NULL,
    `durationMonths` INTEGER NOT NULL,
    `estimatedRoi` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'ACTIVE',
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NULL,
    `investorCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `campaigns_fundingApplicationId_key`(`fundingApplicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `investments` (
    `id` VARCHAR(191) NOT NULL,
    `investorProfileId` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `akadType` ENUM('MUSYARAKAH', 'MURABAHAH') NOT NULL,
    `status` ENUM('ONGOING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'ONGOING',
    `totalProfitReceived` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `confirmedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `akads` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `investmentId` VARCHAR(191) NULL,
    `akadType` ENUM('MUSYARAKAH', 'MURABAHAH') NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `principalAmount` DECIMAL(18, 2) NOT NULL,
    `nisbahUmkm` DOUBLE NOT NULL,
    `nisbahInvestor` DOUBLE NOT NULL,
    `platformFeeRate` DOUBLE NOT NULL DEFAULT 2.5,
    `durationMonths` INTEGER NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `umkmSignedAt` DATETIME(3) NULL,
    `investorSignedAt` DATETIME(3) NULL,
    `blockchainHash` VARCHAR(191) NULL,
    `contractAddress` VARCHAR(191) NULL,
    `blockchainStatus` VARCHAR(191) NULL,
    `deployedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `akads_investmentId_key`(`investmentId`),
    UNIQUE INDEX `akads_blockchainHash_key`(`blockchainHash`),
    UNIQUE INDEX `akads_contractAddress_key`(`contractAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profit_sharings` (
    `id` VARCHAR(191) NOT NULL,
    `akadId` VARCHAR(191) NOT NULL,
    `investmentId` VARCHAR(191) NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `grossRevenue` DECIMAL(18, 2) NOT NULL,
    `investorShare` DECIMAL(18, 2) NOT NULL,
    `umkmShare` DECIMAL(18, 2) NOT NULL,
    `platformFee` DECIMAL(18, 2) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallets` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `lockedBalance` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallets_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `type` ENUM('DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'PROFIT_SHARING', 'PLATFORM_FEE', 'REFUND') NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `balanceBefore` DECIMAL(18, 2) NOT NULL,
    `balanceAfter` DECIMAL(18, 2) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'FLAGGED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    `reference` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `relatedEntityId` VARCHAR(191) NULL,
    `relatedEntityType` VARCHAR(191) NULL,
    `isFlagged` BOOLEAN NOT NULL DEFAULT false,
    `flagReason` TEXT NULL,
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blockchain_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `akadId` VARCHAR(191) NULL,
    `txHash` VARCHAR(191) NOT NULL,
    `blockNumber` BIGINT NULL,
    `contractAddress` VARCHAR(191) NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `gasUsed` BIGINT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `rawData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `blockchain_transactions_txHash_key`(`txHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fraud_alerts` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `alertType` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('DETECTED', 'CONFIRMED', 'IGNORED') NOT NULL DEFAULT 'DETECTED',
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `actionTaken` TEXT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fraud_alerts_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NULL,
    `type` ENUM('SYSTEM', 'KYC', 'INVESTMENT', 'PROFIT_SHARING', 'RISK_ALERT', 'FRAUD_ALERT', 'AKAD', 'BROADCAST') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `data` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_updates` (
    `id` VARCHAR(191) NOT NULL,
    `umkmProfileId` VARCHAR(191) NOT NULL,
    `periodDate` DATETIME(3) NOT NULL,
    `revenue` DECIMAL(18, 2) NOT NULL,
    `expenses` DECIMAL(18, 2) NOT NULL,
    `fundUsageSummary` TEXT NULL,
    `attachments` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `purpose` ENUM('LOGIN', 'REGISTER', 'EMAIL_VERIFY', 'PHONE_VERIFY', 'TRANSACTION') NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `oldData` JSON NULL,
    `newData` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_configs` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `description` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_configs_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_profiles` ADD CONSTRAINT `admin_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `investor_profiles` ADD CONSTRAINT `investor_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `umkm_profiles` ADD CONSTRAINT `umkm_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kyc_documents` ADD CONSTRAINT `kyc_documents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_scores` ADD CONSTRAINT `credit_scores_umkmProfileId_fkey` FOREIGN KEY (`umkmProfileId`) REFERENCES `umkm_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_data` ADD CONSTRAINT `business_data_umkmProfileId_fkey` FOREIGN KEY (`umkmProfileId`) REFERENCES `umkm_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `funding_applications` ADD CONSTRAINT `funding_applications_umkmProfileId_fkey` FOREIGN KEY (`umkmProfileId`) REFERENCES `umkm_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_umkmProfileId_fkey` FOREIGN KEY (`umkmProfileId`) REFERENCES `umkm_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_fundingApplicationId_fkey` FOREIGN KEY (`fundingApplicationId`) REFERENCES `funding_applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `investments` ADD CONSTRAINT `investments_investorProfileId_fkey` FOREIGN KEY (`investorProfileId`) REFERENCES `investor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `investments` ADD CONSTRAINT `investments_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `akads` ADD CONSTRAINT `akads_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `akads` ADD CONSTRAINT `akads_investmentId_fkey` FOREIGN KEY (`investmentId`) REFERENCES `investments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profit_sharings` ADD CONSTRAINT `profit_sharings_akadId_fkey` FOREIGN KEY (`akadId`) REFERENCES `akads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profit_sharings` ADD CONSTRAINT `profit_sharings_investmentId_fkey` FOREIGN KEY (`investmentId`) REFERENCES `investments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blockchain_transactions` ADD CONSTRAINT `blockchain_transactions_akadId_fkey` FOREIGN KEY (`akadId`) REFERENCES `akads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fraud_alerts` ADD CONSTRAINT `fraud_alerts_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_updates` ADD CONSTRAINT `business_updates_umkmProfileId_fkey` FOREIGN KEY (`umkmProfileId`) REFERENCES `umkm_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otp_verifications` ADD CONSTRAINT `otp_verifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

