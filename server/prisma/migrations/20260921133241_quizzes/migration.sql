-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "courseId" TEXT,
    "sectionId" TEXT,
    "finalFormationId" TEXT,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL DEFAULT '',
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "maxAttempts" INTEGER,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "showCorrection" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL DEFAULT '',
    "explanation" TEXT NOT NULL DEFAULT '',
    "points" INTEGER NOT NULL DEFAULT 1,
    "acceptedAnswers" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_choices" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quiz_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "questionOrder" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "score" INTEGER,
    "earnedPoints" INTEGER,
    "totalPoints" INTEGER,
    "passed" BOOLEAN,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempt_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choiceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "text" TEXT NOT NULL DEFAULT '',
    "correct" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "quiz_attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_finalFormationId_key" ON "quizzes"("finalFormationId");

-- CreateIndex
CREATE INDEX "quizzes_formationId_idx" ON "quizzes"("formationId");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_id_formationId_key" ON "quizzes"("id", "formationId");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_courseId_key" ON "quizzes"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_sectionId_key" ON "quizzes"("sectionId");

-- CreateIndex
CREATE INDEX "quiz_questions_quizId_position_idx" ON "quiz_questions"("quizId", "position");

-- CreateIndex
CREATE INDEX "quiz_choices_questionId_position_idx" ON "quiz_choices"("questionId", "position");

-- CreateIndex
CREATE INDEX "quiz_attempts_enrollmentId_quizId_idx" ON "quiz_attempts"("enrollmentId", "quizId");

-- CreateIndex
CREATE INDEX "quiz_attempts_quizId_idx" ON "quiz_attempts"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempt_answers_attemptId_questionId_key" ON "quiz_attempt_answers"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_courseId_formationId_fkey" FOREIGN KEY ("courseId", "formationId") REFERENCES "courses"("id", "formationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_sectionId_formationId_fkey" FOREIGN KEY ("sectionId", "formationId") REFERENCES "sections"("id", "formationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_finalFormationId_fkey" FOREIGN KEY ("finalFormationId") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_choices" ADD CONSTRAINT "quiz_choices_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_formationId_fkey" FOREIGN KEY ("quizId", "formationId") REFERENCES "quizzes"("id", "formationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_enrollmentId_formationId_fkey" FOREIGN KEY ("enrollmentId", "formationId") REFERENCES "enrollments"("id", "formationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Hand-written part (Prisma cannot express these).
-- ---------------------------------------------------------------------------
ALTER TABLE "quizzes"
  ADD CONSTRAINT "quizzes_scope_check" CHECK ("scope" IN ('course', 'section', 'formation')),
  -- the target matches the scope: a lesson, a chapter, or (final quiz) the formation itself
  ADD CONSTRAINT "quizzes_target_check" CHECK (
    ("scope" = 'course'    AND "courseId" IS NOT NULL AND "sectionId" IS NULL     AND "finalFormationId" IS NULL) OR
    ("scope" = 'section'   AND "courseId" IS NULL     AND "sectionId" IS NOT NULL AND "finalFormationId" IS NULL) OR
    ("scope" = 'formation' AND "courseId" IS NULL     AND "sectionId" IS NULL     AND "finalFormationId" = "formationId")
  ),
  ADD CONSTRAINT "quizzes_passing_score_check" CHECK ("passingScore" BETWEEN 0 AND 100),
  ADD CONSTRAINT "quizzes_max_attempts_check" CHECK ("maxAttempts" IS NULL OR "maxAttempts" BETWEEN 1 AND 50);

ALTER TABLE "quiz_questions"
  ADD CONSTRAINT "quiz_questions_type_check" CHECK ("type" IN ('single', 'multiple', 'true_false', 'text')),
  ADD CONSTRAINT "quiz_questions_points_check" CHECK ("points" BETWEEN 1 AND 100),
  ADD CONSTRAINT "quiz_questions_position_check" CHECK ("position" >= 0);

ALTER TABLE "quiz_choices" ADD CONSTRAINT "quiz_choices_position_check" CHECK ("position" >= 0);

ALTER TABLE "quiz_attempts"
  -- an attempt is either open (nothing graded) or submitted (everything graded)
  ADD CONSTRAINT "quiz_attempts_graded_check" CHECK (
    ("submittedAt" IS NULL AND "score" IS NULL AND "earnedPoints" IS NULL AND "totalPoints" IS NULL AND "passed" IS NULL) OR
    ("submittedAt" IS NOT NULL AND "score" BETWEEN 0 AND 100 AND "earnedPoints" >= 0 AND "totalPoints" >= 0 AND "passed" IS NOT NULL)
  );

ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_points_check" CHECK ("points" >= 0);
