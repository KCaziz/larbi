-- Seed: the account categories used until now (P1-06, still referenced by every
-- existing `users.accountType` value) plus the three the client asked for on
-- 2026-09-25. Fixed ids so this migration is reproducible; INSERT IGNORE makes it
-- safe to run on a database where the row already exists.
INSERT IGNORE INTO `account_types` (`id`, `slug`, `label`, `isActive`, `order`, `createdAt`, `updatedAt`) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'auto-entrepreneur', 'Auto-entrepreneur', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000002', 'pme',               'PME',               true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000003', 'pmi',               'PMI',               true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000004', 'etudiant',          'Étudiant',          true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000005', 'lyceen',            'Lycéen',            true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000006', 'salarie',           'Salarié',           true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed: platform settings the admin panel can edit (P3-16). Empty by default —
-- nothing invented; the admin fills them in when the client provides real values.
INSERT IGNORE INTO `platform_settings` (`key`, `value`, `updatedAt`) VALUES
  ('maintenanceMode', 'false', CURRENT_TIMESTAMP),
  ('contactEmail', '', CURRENT_TIMESTAMP),
  ('contactPhone', '', CURRENT_TIMESTAMP),
  ('contactAddress', '', CURRENT_TIMESTAMP);
