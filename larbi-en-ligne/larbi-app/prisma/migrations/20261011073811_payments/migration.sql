-- CreateTable
CREATE TABLE `payment_offers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `accessLevel` VARCHAR(20) NOT NULL DEFAULT 'premium',
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_orders` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `offerId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `accessLevel` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `provider` VARCHAR(30) NOT NULL,
    `providerReference` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `refundedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_orders_providerReference_key`(`providerReference`),
    INDEX `payment_orders_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `payment_orders_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_events` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(30) NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(60) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `outcome` VARCHAR(30) NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payment_events_provider_externalId_key`(`provider`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_orders` ADD CONSTRAINT `payment_orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_orders` ADD CONSTRAINT `payment_orders_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `payment_offers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_events` ADD CONSTRAINT `payment_events_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `payment_orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


-- Integrity enforced by the database itself (P3-09). Money is an integer in the
-- smallest unit: never negative, an offer is never free by accident.
ALTER TABLE `payment_offers`
  ADD CONSTRAINT `payment_offers_name_check` CHECK (OCTET_LENGTH(TRIM(`name`)) > 0),
  ADD CONSTRAINT `payment_offers_amount_check` CHECK (`amount` > 0),
  ADD CONSTRAINT `payment_offers_currency_check` CHECK (`currency` COLLATE utf8mb4_bin REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `payment_offers_access_level_check` CHECK (`accessLevel` IN ('premium')),
  ADD CONSTRAINT `payment_offers_position_check` CHECK (`position` >= 0);

ALTER TABLE `payment_orders`
  ADD CONSTRAINT `payment_orders_amount_check` CHECK (`amount` > 0),
  ADD CONSTRAINT `payment_orders_currency_check` CHECK (`currency` COLLATE utf8mb4_bin REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `payment_orders_access_level_check` CHECK (`accessLevel` IN ('premium')),
  ADD CONSTRAINT `payment_orders_status_check` CHECK (`status` IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  -- A paid (or later refunded) order always says when it was paid; nothing else does.
  ADD CONSTRAINT `payment_orders_paid_at_check` CHECK ((`status` IN ('paid', 'refunded')) = (`paidAt` IS NOT NULL)),
  ADD CONSTRAINT `payment_orders_refunded_at_check` CHECK ((`status` = 'refunded') = (`refundedAt` IS NOT NULL));

ALTER TABLE `payment_events`
  ADD CONSTRAINT `payment_events_outcome_check` CHECK (`outcome` IN ('applied', 'ignored', 'unknown_order', 'amount_mismatch'));
