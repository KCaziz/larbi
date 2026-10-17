-- FINCLUDIA paper portfolio and investment workshop (P6-12), screens C17 and
-- EP03 to EP07.
--
-- Fictional from end to end. `status` is pinned to 'fictional' by a CHECK on
-- all three tables, which is what keeps these rows out of every real total —
-- and P6-11 forbids the reverse, so real patrimony and the paper portfolio can
-- never meet.
--
-- There is no instrument catalogue and no price table: the client supplies
-- neither, and its own rule for this task forbids inventing them. The person
-- names the instrument and states the simulated price themselves.

-- CreateTable
CREATE TABLE `fin_paper_portfolios` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `capital` INTEGER NOT NULL,
    `cash` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `feeRate` DOUBLE NOT NULL DEFAULT 0.01,
    `resetAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `source` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_paper_portfolios_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_paper_instruments` (
    `id` VARCHAR(191) NOT NULL,
    `portfolioId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `markPrice` INTEGER NOT NULL,
    `markedAt` DATETIME(3) NOT NULL,
    `note` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_paper_instruments_portfolioId_label_key`(`portfolioId`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_paper_trades` (
    `id` VARCHAR(191) NOT NULL,
    `portfolioId` VARCHAR(191) NOT NULL,
    `instrumentId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(10) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` INTEGER NOT NULL,
    `fee` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `decidedAt` DATETIME(3) NOT NULL,
    `note` VARCHAR(300) NULL,
    `status` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_paper_trades_portfolioId_decidedAt_idx`(`portfolioId`, `decidedAt`),
    INDEX `fin_paper_trades_instrumentId_idx`(`instrumentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_paper_portfolios` ADD CONSTRAINT `fin_paper_portfolios_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_paper_instruments` ADD CONSTRAINT `fin_paper_instruments_portfolioId_fkey` FOREIGN KEY (`portfolioId`) REFERENCES `fin_paper_portfolios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_paper_trades` ADD CONSTRAINT `fin_paper_trades_portfolioId_fkey` FOREIGN KEY (`portfolioId`) REFERENCES `fin_paper_portfolios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_paper_trades` ADD CONSTRAINT `fin_paper_trades_instrumentId_fkey` FOREIGN KEY (`instrumentId`) REFERENCES `fin_paper_instruments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `fin_paper_portfolios`
  -- Pinned, not merely defaulted: a paper portfolio that could be stored as
  -- anything else would be one query away from entering a real total.
  ADD CONSTRAINT `fin_paper_portfolios_status_check` CHECK (`status` = 'fictional'),
  ADD CONSTRAINT `fin_paper_portfolios_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_paper_portfolios_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_paper_portfolios_capital_check` CHECK (`capital` > 0),
  -- Fictional cash never goes negative: a buy the cash cannot cover is refused,
  -- not borrowed. There is no leverage in a workshop.
  ADD CONSTRAINT `fin_paper_portfolios_cash_check` CHECK (`cash` >= 0),
  ADD CONSTRAINT `fin_paper_portfolios_fee_check` CHECK (`feeRate` >= 0 AND `feeRate` <= 0.1),
  ADD CONSTRAINT `fin_paper_portfolios_version_check` CHECK (`version` >= 1);

ALTER TABLE `fin_paper_instruments`
  ADD CONSTRAINT `fin_paper_instruments_label_check` CHECK (TRIM(`label`) <> ''),
  -- A simulated price of zero is not a price.
  ADD CONSTRAINT `fin_paper_instruments_price_check` CHECK (`markPrice` > 0);

ALTER TABLE `fin_paper_trades`
  ADD CONSTRAINT `fin_paper_trades_status_check` CHECK (`status` = 'fictional'),
  ADD CONSTRAINT `fin_paper_trades_kind_check` CHECK (`kind` IN ('buy', 'sell')),
  ADD CONSTRAINT `fin_paper_trades_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_paper_trades_quantity_check` CHECK (`quantity` > 0),
  ADD CONSTRAINT `fin_paper_trades_price_check` CHECK (`unitPrice` > 0),
  ADD CONSTRAINT `fin_paper_trades_fee_check` CHECK (`fee` >= 0);
