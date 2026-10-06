-- AlterTable
ALTER TABLE "certifications" ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "revokedReason" TEXT;

-- A revocation reason without a revocation date would be meaningless.
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_revoked_check"
  CHECK ("revokedReason" IS NULL OR "revokedAt" IS NOT NULL);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

ALTER TABLE "users" ADD CONSTRAINT "users_status_check"
  CHECK ("status" IN ('active', 'suspended'));

-- CreateTable
CREATE TABLE "account_types" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_types_slug_key" ON "account_types"("slug");

-- Seed: the account categories used until now (P1-06, still referenced by every
-- existing `users.accountType` value) plus the three the client asked for on
-- 2026-09-25. Fixed ids so this migration is reproducible; ON CONFLICT makes it
-- safe to run on a database where the row already exists.
INSERT INTO "account_types" ("id", "slug", "label", "isActive", "order", "createdAt", "updatedAt") VALUES
  ('a0000000-0000-4000-8000-000000000001', 'auto-entrepreneur', 'Auto-entrepreneur', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000002', 'pme',               'PME',               true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000003', 'pmi',               'PMI',               true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000004', 'etudiant',          'Étudiant',          true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000005', 'lyceen',            'Lycéen',            true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000006', 'salarie',           'Salarié',           true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Seed: platform settings the admin panel can edit (P3-16). Empty by default —
-- nothing invented; the admin fills them in when the client provides real values.
INSERT INTO "platform_settings" ("key", "value", "updatedAt") VALUES
  ('maintenanceMode', 'false', CURRENT_TIMESTAMP),
  ('contactEmail', '', CURRENT_TIMESTAMP),
  ('contactPhone', '', CURRENT_TIMESTAMP),
  ('contactAddress', '', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
