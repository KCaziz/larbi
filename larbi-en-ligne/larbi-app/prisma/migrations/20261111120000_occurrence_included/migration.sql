-- R11-12: an income (or a payment) already counted in the account's starting
-- balance is settled without being credited again: outcome "included".
ALTER TABLE `fin_occurrences` DROP CONSTRAINT `fin_occurrences_outcome_check`;
ALTER TABLE `fin_occurrences` ADD CONSTRAINT `fin_occurrences_outcome_check` CHECK (`outcome` IN ('confirmed', 'missed', 'postponed', 'included'));
