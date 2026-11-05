-- P8-24: browsers that agreed to receive notifications (Web Push).
CREATE TABLE `fin_push_subscriptions` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `endpoint` VARCHAR(700) NOT NULL,
  `p256dh` VARCHAR(200) NOT NULL,
  `auth` VARCHAR(100) NOT NULL,
  `label` VARCHAR(80) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastSentAt` DATETIME(3) NULL,
  UNIQUE INDEX `fin_push_subscriptions_endpoint_key`(`endpoint`),
  INDEX `fin_push_subscriptions_userId_idx`(`userId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fin_push_subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
