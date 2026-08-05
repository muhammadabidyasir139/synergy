-- AlterTable investor_profiles
ALTER TABLE `investor_profiles` ADD COLUMN `transactionPinHash` VARCHAR(255) NULL;
ALTER TABLE `investor_profiles` ADD COLUMN `pinSetAt` DATETIME(3) NULL;
ALTER TABLE `investor_profiles` ADD COLUMN `pinFailedAttempts` INT NOT NULL DEFAULT 0;
ALTER TABLE `investor_profiles` ADD COLUMN `pinLockedUntil` DATETIME(3) NULL;
ALTER TABLE `investor_profiles` ADD COLUMN `district` VARCHAR(255) NULL;
ALTER TABLE `investor_profiles` ADD COLUMN `postalCode` VARCHAR(255) NULL;

-- AlterTable umkm_profiles
ALTER TABLE `umkm_profiles` ADD COLUMN `district` VARCHAR(255) NULL;
ALTER TABLE `umkm_profiles` ADD COLUMN `postalCode` VARCHAR(255) NULL;
