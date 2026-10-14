-- AlterTable
ALTER TABLE `users` ADD COLUMN `finNotificationSettings` JSON NOT NULL DEFAULT ('{}');

-- CreateTable
CREATE TABLE `fin_notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(40) NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `priority` VARCHAR(20) NOT NULL,
    `params` JSON NOT NULL,
    `link` VARCHAR(200) NULL,
    `referenceId` VARCHAR(191) NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_notifications_userId_read_createdAt_idx`(`userId`, `read`, `createdAt`),
    INDEX `fin_notifications_userId_type_referenceId_idx`(`userId`, `type`, `referenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_notifications` ADD CONSTRAINT `fin_notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CheckConstraint (hand-written: MariaDB refuses a CHECK on a FOREIGN KEY column)
ALTER TABLE `fin_notifications`
  ADD CONSTRAINT `fin_notifications_category_check` CHECK (`category` IN ('action', 'information', 'securite')),
  ADD CONSTRAINT `fin_notifications_priority_check` CHECK (`priority` IN ('securite', 'echeance', 'budget', 'apprentissage')),
  ADD CONSTRAINT `fin_notifications_params_check` CHECK (JSON_TYPE(`params`) = 'OBJECT');

ALTER TABLE `users`
  ADD CONSTRAINT `users_notification_settings_check` CHECK (JSON_TYPE(`finNotificationSettings`) = 'OBJECT');
