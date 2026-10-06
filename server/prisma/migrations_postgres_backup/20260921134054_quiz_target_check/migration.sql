-- The final quiz must carry its marker: with "finalFormationId" NULL the previous comparison was
-- NULL (unknown), which a CHECK constraint lets through.
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_target_check";
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_target_check" CHECK (
  ("scope" = 'course'    AND "courseId" IS NOT NULL AND "sectionId" IS NULL     AND "finalFormationId" IS NULL) OR
  ("scope" = 'section'   AND "courseId" IS NULL     AND "sectionId" IS NOT NULL AND "finalFormationId" IS NULL) OR
  ("scope" = 'formation' AND "courseId" IS NULL     AND "sectionId" IS NULL     AND "finalFormationId" IS NOT NULL AND "finalFormationId" = "formationId")
);
