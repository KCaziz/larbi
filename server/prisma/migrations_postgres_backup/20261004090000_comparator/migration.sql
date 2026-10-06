-- Bank comparator (P4-06): banks and their conditions, rubric by rubric.

-- CreateTable
CREATE TABLE "comparator_banks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comparator_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparator_conditions" (
    "id" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "segment" TEXT NOT NULL DEFAULT 'non_precise',
    "category" TEXT,
    "label" TEXT NOT NULL,
    "values" JSONB NOT NULL DEFAULT '{}',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comparator_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparator_meta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "dataUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comparator_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comparator_banks_name_key" ON "comparator_banks"("name");

-- CreateIndex
CREATE INDEX "comparator_conditions_theme_position_idx" ON "comparator_conditions"("theme", "position");

-- CreateIndex
CREATE INDEX "comparator_conditions_bankId_idx" ON "comparator_conditions"("bankId");

-- AddForeignKey
ALTER TABLE "comparator_conditions" ADD CONSTRAINT "comparator_conditions_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "comparator_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The database refuses what the application would refuse, even if a code path were wrong.
ALTER TABLE "comparator_banks" ADD CONSTRAINT "comparator_banks_name_check"
  CHECK (length(btrim("name")) > 0);

-- The 11 rubrics of the client's guide (src/constants/comparator.js).
ALTER TABLE "comparator_conditions" ADD CONSTRAINT "comparator_conditions_theme_check"
  CHECK ("theme" IN ('comptes', 'versements-retraits', 'carte-locale', 'epargne', 'coffres-forts', 'credits',
                     'virements', 'carte-internationale', 'devises', 'operations-diverses', 'cheques'));

ALTER TABLE "comparator_conditions" ADD CONSTRAINT "comparator_conditions_segment_check"
  CHECK ("segment" IN ('particulier', 'professionnel', 'entreprise', 'non_precise'));

ALTER TABLE "comparator_conditions" ADD CONSTRAINT "comparator_conditions_label_check"
  CHECK (length(btrim("label")) > 0);

ALTER TABLE "comparator_conditions" ADD CONSTRAINT "comparator_conditions_category_check"
  CHECK ("category" IS NULL OR length(btrim("category")) > 0);

-- The values are an object of texts ({ "fee": "100 DA", "period": "Mensuel" }).
ALTER TABLE "comparator_conditions" ADD CONSTRAINT "comparator_conditions_values_check"
  CHECK (jsonb_typeof("values") = 'object');

-- A single row: the date the comparator's data last changed.
ALTER TABLE "comparator_meta" ADD CONSTRAINT "comparator_meta_single_row_check"
  CHECK ("id" = 1);
