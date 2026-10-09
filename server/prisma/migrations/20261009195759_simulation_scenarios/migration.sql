-- CreateTable
CREATE TABLE `simulation_scenarios` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `simulator` VARCHAR(191) NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `inputs` JSON NOT NULL,
    `hypotheses` JSON NULL,
    `versions` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `simulation_scenarios_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `simulation_scenarios` ADD CONSTRAINT `simulation_scenarios_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
