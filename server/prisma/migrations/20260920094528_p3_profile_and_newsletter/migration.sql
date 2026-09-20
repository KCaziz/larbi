-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "requiredAccessLevel" TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN     "targetAccountTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "lastEmailAt" TIMESTAMP(3),

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers"("status");

-- Hand-written integrity rules (Prisma cannot express CHECK constraints).
ALTER TABLE "articles"
  ADD CONSTRAINT "articles_required_access_level_check" CHECK ("requiredAccessLevel" IN ('standard', 'premium'));

ALTER TABLE "newsletter_subscribers"
  ADD CONSTRAINT "newsletter_status_check" CHECK ("status" IN ('pending', 'confirmed', 'unsubscribed')),
  ADD CONSTRAINT "newsletter_email_normalised_check" CHECK ("email" = lower(btrim("email"))),
  ADD CONSTRAINT "newsletter_confirmed_at_check" CHECK (("status" = 'pending') OR ("confirmedAt" IS NOT NULL)),
  ADD CONSTRAINT "newsletter_unsubscribed_at_check" CHECK (("status" = 'unsubscribed') = ("unsubscribedAt" IS NOT NULL));
