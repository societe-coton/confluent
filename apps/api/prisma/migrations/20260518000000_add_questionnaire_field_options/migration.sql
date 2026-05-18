ALTER TABLE "questionnaire_fields" ADD COLUMN "options" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
