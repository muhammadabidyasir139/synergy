-- CreateTable
CREATE TABLE IF NOT EXISTS `akad_variable` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `id_umkm` VARCHAR(255) NOT NULL,
    `aset_lancar` DECIMAL(20,2) NOT NULL,
    `total_hutang_kas` DECIMAL(20,2) NOT NULL,
    `laba_bersih` DECIMAL(20,2) NOT NULL,
    `total_pendapatan` DECIMAL(20,2) NOT NULL,
    `total_beban` DECIMAL(20,2) NOT NULL,
    `rata_rata_arus_kas` DECIMAL(20,2) NOT NULL,
    `aset_tidak_lancar` DECIMAL(20,2) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `idx_akad_variable_id_umkm` (`id_umkm`),
    CONSTRAINT `fk_variable_umkm` FOREIGN KEY (`id_umkm`) REFERENCES `umkm_profiles`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
