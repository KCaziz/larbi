-- P8-03 — the metadata socle on accounts (P6-02), so the consistency control,
-- the inventory and the export of the trust centre cover them like every
-- other financial table. The accounts written by the previous migration were
-- created by the system from existing movements: `computed`, `declared`.

ALTER TABLE `fin_accounts` ADD COLUMN `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `confidence` VARCHAR(10) NULL,
    ADD COLUMN `consentUses` JSON NULL,
    ADD COLUMN `effectiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `scope` VARCHAR(20) NOT NULL DEFAULT 'personal',
    ADD COLUMN `source` VARCHAR(20) NOT NULL DEFAULT 'computed',
    ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'declared',
    ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1;

UPDATE `fin_accounts` SET `consentUses` = '[]';

ALTER TABLE `fin_accounts` MODIFY `consentUses` JSON NOT NULL,
    ALTER COLUMN `source` DROP DEFAULT,
    ALTER COLUMN `status` DROP DEFAULT;

ALTER TABLE `fin_accounts`
  ADD CONSTRAINT `fin_accounts_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_accounts_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_accounts_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_accounts_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_accounts_version_check` CHECK (`version` >= 1);
