-- R20 (2026-11-28): the trade register number of a client or a supplier, next to its NIF.
ALTER TABLE `fin_business_contacts` ADD COLUMN `tradeRegister` VARCHAR(40) NULL;

-- The answer of a module exercise starts empty in the database too, as in schema.prisma.
ALTER TABLE `fin_skill_records` ALTER COLUMN `exerciseAnswer` SET DEFAULT '';
