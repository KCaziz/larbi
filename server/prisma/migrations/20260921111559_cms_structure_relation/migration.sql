-- RenameForeignKey
ALTER TABLE "courses" RENAME CONSTRAINT "courses_section_same_formation_fkey" TO "courses_sectionId_formationId_fkey";
