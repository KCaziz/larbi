-- P13-05, lot D bis (2026-11-25) - invoices in a foreign currency (19_CYCLE_FACTURE
-- FAC-014 export invoice, FAC-015 partial export payment, FAC-016 export credit
-- note; FAC-013 for a supplier invoice in a foreign currency).
-- The amounts the engine adds up stay in the organisation's currency, converted at
-- the dated rate of the invoice; the invoice keeps its own currency, amounts and
-- rate. A payment in that currency carries its own dated rate: the receivable is
-- followed in the currency, and the exchange difference is shown, never hidden.

ALTER TABLE `fin_business_documents` ADD COLUMN `foreignCurrency` VARCHAR(3) NULL;
ALTER TABLE `fin_business_documents` ADD COLUMN `foreignAmountExcl` DOUBLE NULL;
ALTER TABLE `fin_business_documents` ADD COLUMN `foreignTaxAmount` DOUBLE NULL;
ALTER TABLE `fin_business_documents` ADD COLUMN `bookingRate` DOUBLE NULL;
ALTER TABLE `fin_business_documents` ADD COLUMN `rateDate` DATETIME(3) NULL;
ALTER TABLE `fin_business_documents` ADD COLUMN `rateSource` VARCHAR(120) NULL;
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_business_document_foreign` CHECK ((`foreignCurrency` IS NULL AND `bookingRate` IS NULL) OR (`foreignCurrency` IS NOT NULL AND `bookingRate` > 0 AND `foreignAmountExcl` >= 0 AND `foreignTaxAmount` >= 0 AND `rateDate` IS NOT NULL));

ALTER TABLE `fin_business_payments` ADD COLUMN `foreignValue` DOUBLE NULL;
ALTER TABLE `fin_business_payments` ADD COLUMN `rate` DOUBLE NULL;
ALTER TABLE `fin_business_payments` ADD COLUMN `rateDate` DATETIME(3) NULL;
ALTER TABLE `fin_business_payments` ADD CONSTRAINT `chk_business_payment_foreign` CHECK ((`foreignValue` IS NULL AND `rate` IS NULL) OR (`foreignValue` > 0 AND `rate` > 0 AND `rateDate` IS NOT NULL));
