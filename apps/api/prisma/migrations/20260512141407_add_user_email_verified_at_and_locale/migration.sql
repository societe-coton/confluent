-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'fr';

-- Backfill: existing active users have already verified (otherwise they couldn't have been authenticated).
-- New semantics: login requires `is_active = TRUE AND email_verified_at IS NOT NULL`.
-- Inactive users keep email_verified_at NULL; they were blocked anyway.
UPDATE "users" SET "email_verified_at" = NOW() WHERE "is_active" = TRUE;
