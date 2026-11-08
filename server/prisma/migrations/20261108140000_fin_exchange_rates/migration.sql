-- P10-05 — Cours officiels (Banque d'Algérie) des devises, à une date de référence.
-- Combien de dinars pour UNE unité. Saisis par un administrateur ; premier jeu :
-- cours officiels du 4 novembre 2026 relevés par la presse (la page de la Banque
-- d'Algérie n'était pas lisible automatiquement), à vérifier sur bank-of-algeria.dz.
CREATE TABLE `fin_exchange_rates` (
    `id` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `rate` DOUBLE NOT NULL,
    `referenceDate` DATE NOT NULL,
    `source` VARCHAR(200) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_exchange_rates_currency_referenceDate_key`(`currency`, `referenceDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `fin_exchange_rates` (`id`, `currency`, `rate`, `referenceDate`, `source`, `createdAt`, `updatedAt`) VALUES ('5f0c1d2e-0000-4000-8000-000000000001', 'EUR', 152.07, '2026-11-04', 'Banque d''Algérie, cours officiel du 4 novembre 2026', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
INSERT INTO `fin_exchange_rates` (`id`, `currency`, `rate`, `referenceDate`, `source`, `createdAt`, `updatedAt`) VALUES ('5f0c1d2e-0000-4000-8000-000000000002', 'USD', 135.91, '2026-11-04', 'Banque d''Algérie, cours officiel du 4 novembre 2026', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
INSERT INTO `fin_exchange_rates` (`id`, `currency`, `rate`, `referenceDate`, `source`, `createdAt`, `updatedAt`) VALUES ('5f0c1d2e-0000-4000-8000-000000000003', 'GBP', 182.39, '2026-11-04', 'Banque d''Algérie, cours officiel du 4 novembre 2026', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
INSERT INTO `fin_exchange_rates` (`id`, `currency`, `rate`, `referenceDate`, `source`, `createdAt`, `updatedAt`) VALUES ('5f0c1d2e-0000-4000-8000-000000000004', 'CAD', 97.21, '2026-11-04', 'Banque d''Algérie, cours officiel du 4 novembre 2026', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
