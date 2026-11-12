-- Align PostgreSQL with the supplied gradpath_complete_database.sql MySQL dump.
-- Preserve existing rows and the already-applied initial migration.

-- CreateEnum
CREATE TYPE "student_profiles_current_education_level" AS ENUM ('undergraduate', 'graduate', 'other');

-- CreateEnum
CREATE TYPE "student_profiles_attendance_type" AS ENUM ('traditional', 'non_traditional');

-- CreateEnum
CREATE TYPE "weekly_time_preferences_preference_type" AS ENUM ('preferred_class', 'work', 'unavailable');

-- AlterEnum
ALTER TYPE "users_role" ADD VALUE 'advisor';

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "attendance_type" "student_profiles_attendance_type",
ADD COLUMN     "current_education_level" "student_profiles_current_education_level";

-- CreateTable
CREATE TABLE "advisor_assignments" (
    "advisor_user_id" BIGINT NOT NULL,
    "student_user_id" BIGINT NOT NULL,
    "assigned_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(0),

    CONSTRAINT "advisor_assignments_pkey" PRIMARY KEY ("advisor_user_id","student_user_id")
);

-- CreateTable
CREATE TABLE "weekly_time_preferences" (
    "time_preference_id" BIGSERIAL NOT NULL,
    "student_user_id" BIGINT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "preference_type" "weekly_time_preferences_preference_type" NOT NULL,
    "notes" VARCHAR(255),

    CONSTRAINT "weekly_time_preferences_pkey" PRIMARY KEY ("time_preference_id")
);

-- CreateIndex
CREATE INDEX "idx_advisor_assignments_student" ON "advisor_assignments"("student_user_id");

-- CreateIndex
CREATE INDEX "idx_weekly_prefs_student_day" ON "weekly_time_preferences"("student_user_id", "weekday");

-- AddForeignKey
ALTER TABLE "advisor_assignments" ADD CONSTRAINT "fk_advisor_assignments_advisor" FOREIGN KEY ("advisor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "advisor_assignments" ADD CONSTRAINT "fk_advisor_assignments_student" FOREIGN KEY ("student_user_id") REFERENCES "student_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weekly_time_preferences" ADD CONSTRAINT "fk_weekly_time_preferences_student" FOREIGN KEY ("student_user_id") REFERENCES "student_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "career_opportunities" DROP CONSTRAINT "fk_career_opportunities_course";
ALTER TABLE "career_opportunities" ADD CONSTRAINT "fk_career_opportunities_course" FOREIGN KEY ("related_course_id") REFERENCES "courses"("course_id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "career_opportunities" DROP CONSTRAINT "fk_career_opportunities_skill";
ALTER TABLE "career_opportunities" ADD CONSTRAINT "fk_career_opportunities_skill" FOREIGN KEY ("related_skill_id") REFERENCES "skills"("skill_id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "course_history" DROP CONSTRAINT "fk_course_history_course";
ALTER TABLE "course_history" ADD CONSTRAINT "fk_course_history_course" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "course_history" DROP CONSTRAINT "fk_course_history_term";
ALTER TABLE "course_history" ADD CONSTRAINT "fk_course_history_term" FOREIGN KEY ("term_id") REFERENCES "terms"("term_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- MySQL CHECK constraints and unsigned values are not represented in Prisma models.
ALTER TABLE "advisor_assignments"
  ADD CONSTRAINT "ck_advisor_assignment_dates" CHECK (ended_at IS NULL OR ended_at >= assigned_at),
  ADD CONSTRAINT "ck_advisor_assignments_advisor_nonnegative" CHECK (advisor_user_id >= 0),
  ADD CONSTRAINT "ck_advisor_assignments_student_nonnegative" CHECK (student_user_id >= 0);
ALTER TABLE "weekly_time_preferences"
  ADD CONSTRAINT "ck_weekly_prefs_time" CHECK (start_time < end_time),
  ADD CONSTRAINT "ck_weekly_prefs_weekday" CHECK (weekday BETWEEN 1 AND 7),
  ADD CONSTRAINT "ck_weekly_prefs_id_nonnegative" CHECK (time_preference_id >= 0),
  ADD CONSTRAINT "ck_weekly_prefs_student_nonnegative" CHECK (student_user_id >= 0);
