-- Hand-written integrity constraints (Prisma cannot express CHECK). Ported from the
-- project's PostgreSQL migrations (see prisma/migrations_postgres_backup/) to
-- MySQL/MariaDB dialect: `btrim` -> `trim`, the `~` regex operator -> `REGEXP`,
-- `jsonb_typeof(x) = 'object'/'array'` -> `JSON_TYPE(x) = 'OBJECT'/'ARRAY'`,
-- the `::type` cast suffix dropped (not needed here). Written with backtick-quoted
-- identifiers, the native MySQL/MariaDB style (no ANSI_QUOTES dependency).
--
-- Three rules from the PostgreSQL version are NOT ported as CHECK constraints:
-- MariaDB refuses a CHECK that references a column carrying a FOREIGN KEY
-- (error 1901, confirmed interactively — not a typo), whatever its ON DELETE
-- action. `media_owner_check`, `lesson_blocks_media_check` and
-- `quizzes_target_check` each only exist to compare FOREIGN KEY columns, so
-- none of the three can be expressed here at all. They are checked instead by
-- `services/consistency.service.js` (its own docstring already says it exists
-- for "rules SQL cannot express" — this is now one more case of that, not a
-- new mechanism), run by `npm run check:consistency` and the test suite.

-- ---- users -------------------------------------------------------------
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_check` CHECK (`role` IN ('user', 'admin')),
  ADD CONSTRAINT `users_accessLevel_check` CHECK (`accessLevel` IN ('standard', 'premium')),
  ADD CONSTRAINT `users_status_check` CHECK (`status` IN ('active', 'suspended'));

-- ---- formations / courses / media / enrollments / progress -------------
ALTER TABLE `formations`
  ADD CONSTRAINT `formations_status_check` CHECK (`status` IN ('draft', 'in_review', 'published', 'archived')),
  ADD CONSTRAINT `formations_requiredAccessLevel_check` CHECK (`requiredAccessLevel` IN ('standard', 'premium')),
  ADD CONSTRAINT `formations_publishedAt_check` CHECK ((`status` = 'published') = (`publishedAt` IS NOT NULL)),
  ADD CONSTRAINT `formations_level_check` CHECK (`level` IS NULL OR `level` IN ('beginner', 'intermediate', 'advanced'));

ALTER TABLE `courses`
  ADD CONSTRAINT `courses_position_check` CHECK (`position` >= 0),
  ADD CONSTRAINT `courses_estimatedMinutes_check` CHECK (`estimatedMinutes` IS NULL OR `estimatedMinutes` >= 0);

ALTER TABLE `media`
  ADD CONSTRAINT `media_kind_check` CHECK (`kind` IN ('video', 'image', 'document')),
  ADD CONSTRAINT `media_sizeBytes_check` CHECK (`sizeBytes` >= 0);
  -- media_owner_check (a file belongs to at most one lesson OR one article) is NOT
  -- a CHECK here: both columns are FOREIGN KEYs (see the note at the top of this file).
  -- Checked instead by consistency.service.js.

ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_status_check` CHECK (`status` IN ('active', 'completed')),
  ADD CONSTRAINT `enrollments_completedAt_check` CHECK ((`status` = 'completed') = (`completedAt` IS NOT NULL));

ALTER TABLE `course_progress`
  ADD CONSTRAINT `course_progress_status_check` CHECK (`status` IN ('in_progress', 'completed')),
  ADD CONSTRAINT `course_progress_completedAt_check` CHECK ((`status` = 'completed') = (`completedAt` IS NOT NULL));

ALTER TABLE `sections` ADD CONSTRAINT `sections_position_check` CHECK (`position` >= 0);

-- ---- lesson blocks / revisions -------------------------------------------
ALTER TABLE `lesson_blocks`
  ADD CONSTRAINT `lesson_blocks_type_check`
    CHECK (`type` IN ('text', 'image', 'video', 'file', 'code', 'table', 'quote', 'callout', 'resources')),
  ADD CONSTRAINT `lesson_blocks_position_check` CHECK (`position` >= 0),
  ADD CONSTRAINT `lesson_blocks_data_object_check` CHECK (JSON_TYPE(`data`) = 'OBJECT');
  -- lesson_blocks_media_check ((type IN (image,video,file)) = (mediaId IS NOT NULL)) is NOT
  -- a CHECK here: mediaId is a FOREIGN KEY (see the note at the top of this file).
  -- Checked instead by consistency.service.js.

ALTER TABLE `lesson_revisions`
  ADD CONSTRAINT `lesson_revisions_blocks_array_check` CHECK (JSON_TYPE(`blocks`) = 'ARRAY');

-- ---- quizzes -------------------------------------------------------------
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_scope_check` CHECK (`scope` IN ('course', 'section', 'formation')),
  ADD CONSTRAINT `quizzes_passing_score_check` CHECK (`passingScore` BETWEEN 0 AND 100),
  ADD CONSTRAINT `quizzes_max_attempts_check` CHECK (`maxAttempts` IS NULL OR `maxAttempts` BETWEEN 1 AND 50);
  -- quizzes_target_check (the target matches the scope: a lesson, a chapter, or (final
  -- quiz) the formation itself) is NOT a CHECK here: courseId, sectionId,
  -- finalFormationId and formationId are all FOREIGN KEYs (see the note at the top of
  -- this file). Checked instead by consistency.service.js.

ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `quiz_questions_type_check` CHECK (`type` IN ('single', 'multiple', 'true_false', 'text')),
  ADD CONSTRAINT `quiz_questions_points_check` CHECK (`points` BETWEEN 1 AND 100),
  ADD CONSTRAINT `quiz_questions_position_check` CHECK (`position` >= 0);

ALTER TABLE `quiz_choices` ADD CONSTRAINT `quiz_choices_position_check` CHECK (`position` >= 0);

ALTER TABLE `quiz_attempts`
  -- an attempt is either open (nothing graded) or submitted (everything graded)
  ADD CONSTRAINT `quiz_attempts_graded_check` CHECK (
    (`submittedAt` IS NULL AND `score` IS NULL AND `earnedPoints` IS NULL AND `totalPoints` IS NULL AND `passed` IS NULL) OR
    (`submittedAt` IS NOT NULL AND `score` BETWEEN 0 AND 100 AND `earnedPoints` >= 0 AND `totalPoints` >= 0 AND `passed` IS NOT NULL)
  );

ALTER TABLE `quiz_attempt_answers` ADD CONSTRAINT `quiz_attempt_answers_points_check` CHECK (`points` >= 0);

-- ---- blog ------------------------------------------------------------------
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_status_check` CHECK (`status` IN ('draft', 'published')),
  -- A published article always has a publication date, a draft never has one.
  ADD CONSTRAINT `articles_publishedAt_check` CHECK ((`status` = 'published') = (`publishedAt` IS NOT NULL)),
  ADD CONSTRAINT `articles_title_check` CHECK (length(trim(`title`)) > 0),
  -- Slugs are used in public URLs: lower-case words joined by dashes, nothing else.
  ADD CONSTRAINT `articles_slug_check` CHECK (`slug` REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(`slug`) <= 80),
  ADD CONSTRAINT `articles_required_access_level_check` CHECK (`requiredAccessLevel` IN ('standard', 'premium')),
  ADD CONSTRAINT `articles_language_check` CHECK (`language` IN ('fr', 'en', 'ar'));

ALTER TABLE `article_categories`
  ADD CONSTRAINT `article_categories_slug_check` CHECK (`slug` REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(`slug`) <= 80);

ALTER TABLE `tags`
  ADD CONSTRAINT `tags_slug_check` CHECK (`slug` REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(`slug`) <= 80);

ALTER TABLE `article_translations`
  ADD CONSTRAINT `article_translations_language_check` CHECK (`language` IN ('fr', 'en', 'ar')),
  ADD CONSTRAINT `article_translations_content_check` CHECK (length(trim(`title`)) > 0 AND `bodyText` <> '');

-- ---- newsletter --------------------------------------------------------------
ALTER TABLE `newsletter_subscribers`
  ADD CONSTRAINT `newsletter_status_check` CHECK (`status` IN ('pending', 'confirmed', 'unsubscribed')),
  ADD CONSTRAINT `newsletter_email_normalised_check` CHECK (`email` = lower(trim(`email`))),
  ADD CONSTRAINT `newsletter_confirmed_at_check` CHECK ((`status` = 'pending') OR (`confirmedAt` IS NOT NULL)),
  ADD CONSTRAINT `newsletter_unsubscribed_at_check` CHECK ((`status` = 'unsubscribed') = (`unsubscribedAt` IS NOT NULL));

-- ---- certifications ------------------------------------------------------------
ALTER TABLE `certifications`
  ADD CONSTRAINT `certifications_revoked_reason_check` CHECK (`revokedReason` IS NULL OR `revokedAt` IS NOT NULL);

-- ---- bank comparator (P4-06) ----------------------------------------------------
ALTER TABLE `comparator_banks`
  ADD CONSTRAINT `comparator_banks_name_check` CHECK (length(trim(`name`)) > 0);

-- The 11 rubrics of the client's guide (src/constants/comparator.js).
ALTER TABLE `comparator_conditions`
  ADD CONSTRAINT `comparator_conditions_theme_check`
    CHECK (`theme` IN ('comptes', 'versements-retraits', 'carte-locale', 'epargne', 'coffres-forts', 'credits',
                       'virements', 'carte-internationale', 'devises', 'operations-diverses', 'cheques')),
  ADD CONSTRAINT `comparator_conditions_segment_check`
    CHECK (`segment` IN ('particulier', 'professionnel', 'entreprise', 'non_precise')),
  ADD CONSTRAINT `comparator_conditions_label_check` CHECK (length(trim(`label`)) > 0),
  ADD CONSTRAINT `comparator_conditions_category_check` CHECK (`category` IS NULL OR length(trim(`category`)) > 0),
  -- The values are an object of texts ({ "fee": "100 DA", "period": "Mensuel" }).
  ADD CONSTRAINT `comparator_conditions_values_check` CHECK (JSON_TYPE(`values`) = 'OBJECT');

-- A single row: the date the comparator's data last changed.
ALTER TABLE `comparator_meta` ADD CONSTRAINT `comparator_meta_single_row_check` CHECK (`id` = 1);
