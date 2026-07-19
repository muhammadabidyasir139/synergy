-- CreateTable
-- Note: this table was already created manually in production before this migration
-- was written, so table/constraint creation is guarded to stay a no-op there while
-- still being reproducible on a fresh database.
CREATE TABLE IF NOT EXISTS "akad_variable" (
    "id" SERIAL NOT NULL,
    "id_umkm" TEXT NOT NULL,
    "aset_lancar" DECIMAL(20,2) NOT NULL,
    "total_hutang_kas" DECIMAL(20,2) NOT NULL,
    "laba_bersih" DECIMAL(20,2) NOT NULL,
    "total_pendapatan" DECIMAL(20,2) NOT NULL,
    "total_beban" DECIMAL(20,2) NOT NULL,
    "rata_rata_arus_kas" DECIMAL(20,2) NOT NULL,
    "aset_tidak_lancar" DECIMAL(20,2) NOT NULL,

    CONSTRAINT "akad_variable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_variable_umkm'
    ) THEN
        ALTER TABLE "akad_variable"
            ADD CONSTRAINT "fk_variable_umkm" FOREIGN KEY ("id_umkm") REFERENCES "umkm_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_akad_variable_id_umkm" ON "akad_variable"("id_umkm");
