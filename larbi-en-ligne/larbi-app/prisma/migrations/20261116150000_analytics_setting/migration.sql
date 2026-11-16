-- P12-06: Google Analytics 4 measurement identifier, edited from the admin
-- settings. Empty = no analytics at all (nothing is loaded on the website).
INSERT INTO `platform_settings` (`key`, `value`, `updatedAt`) VALUES ('gaMeasurementId', '', NOW(3))
  ON DUPLICATE KEY UPDATE `key` = `key`;
