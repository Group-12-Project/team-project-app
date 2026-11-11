-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "career_opportunities_category" AS ENUM ('club_organization', 'skill_course', 'internship');

-- CreateEnum
CREATE TYPE "interview_questions_category" AS ENUM ('behavioral', 'technical');

-- CreateEnum
CREATE TYPE "interview_progress_status" AS ENUM ('not_started', 'practiced', 'completed');

-- CreateEnum
CREATE TYPE "program_courses_requirement_type" AS ENUM ('required', 'elective');

-- CreateEnum
CREATE TYPE "programs_degree_level" AS ENUM ('bachelors', 'masters', 'doctorate', 'certificate', 'other');

-- CreateEnum
CREATE TYPE "course_offerings_delivery_mode" AS ENUM ('in_person', 'online', 'hybrid', 'other');

-- CreateEnum
CREATE TYPE "review_flags_status" AS ENUM ('open', 'under_review', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "course_reviews_moderation_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "programs_publication_status" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "course_history_completion_status" AS ENUM ('completed', 'in_progress', 'withdrawn', 'failed', 'transferred');

-- CreateEnum
CREATE TYPE "courses_publication_status" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "users_role" AS ENUM ('student', 'admin');

-- CreateEnum
CREATE TYPE "users_account_status" AS ENUM ('pending', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "career_opportunities_publication_status" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "admin_audit_events" (
    "event_id" BIGSERIAL NOT NULL,
    "admin_user_id" BIGINT NOT NULL,
    "action_name" VARCHAR(120) NOT NULL,
    "entity_type" VARCHAR(80) NOT NULL,
    "entity_id" BIGINT,
    "action_details" TEXT,
    "event_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "career_opportunities" (
    "opportunity_id" BIGSERIAL NOT NULL,
    "category" "career_opportunities_category" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "summary" TEXT,
    "why_it_helps" TEXT,
    "next_action" VARCHAR(255),
    "related_course_id" BIGINT,
    "related_skill_id" BIGINT,
    "publication_status" "career_opportunities_publication_status" NOT NULL DEFAULT 'draft',

    CONSTRAINT "career_opportunities_pkey" PRIMARY KEY ("opportunity_id")
);

-- CreateTable
CREATE TABLE "concentrations" (
    "concentration_id" BIGSERIAL NOT NULL,
    "program_id" BIGINT NOT NULL,
    "concentration_name" VARCHAR(160) NOT NULL,

    CONSTRAINT "concentrations_pkey" PRIMARY KEY ("concentration_id")
);

-- CreateTable
CREATE TABLE "course_history" (
    "history_id" BIGSERIAL NOT NULL,
    "student_user_id" BIGINT NOT NULL,
    "course_id" BIGINT,
    "term_id" BIGINT,
    "course_code_snapshot" VARCHAR(30),
    "course_title_snapshot" VARCHAR(200),
    "completion_status" "course_history_completion_status" NOT NULL,
    "earned_credits" DECIMAL(4,1) NOT NULL DEFAULT 0.0,
    "grade" VARCHAR(10),

    CONSTRAINT "course_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "course_offerings" (
    "offering_id" BIGSERIAL NOT NULL,
    "course_id" BIGINT NOT NULL,
    "term_id" BIGINT NOT NULL,
    "section" VARCHAR(30) NOT NULL,
    "delivery_mode" "course_offerings_delivery_mode" NOT NULL DEFAULT 'in_person',

    CONSTRAINT "course_offerings_pkey" PRIMARY KEY ("offering_id")
);

-- CreateTable
CREATE TABLE "course_prerequisites" (
    "course_id" BIGINT NOT NULL,
    "prerequisite_course_id" BIGINT NOT NULL,

    CONSTRAINT "course_prerequisites_pkey" PRIMARY KEY ("course_id","prerequisite_course_id")
);

-- CreateTable
CREATE TABLE "course_reviews" (
    "review_id" BIGSERIAL NOT NULL,
    "course_id" BIGINT NOT NULL,
    "student_user_id" BIGINT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review_text" TEXT,
    "moderation_status" "course_reviews_moderation_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "course_skills" (
    "course_id" BIGINT NOT NULL,
    "skill_id" BIGINT NOT NULL,

    CONSTRAINT "course_skills_pkey" PRIMARY KEY ("course_id","skill_id")
);

-- CreateTable
CREATE TABLE "courses" (
    "course_id" BIGSERIAL NOT NULL,
    "course_code" VARCHAR(30),
    "title" VARCHAR(200) NOT NULL,
    "credits" DECIMAL(4,1) NOT NULL,
    "description" TEXT,
    "learning_outcomes" TEXT,
    "publication_status" "courses_publication_status" NOT NULL DEFAULT 'draft',

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "interview_progress" (
    "student_user_id" BIGINT NOT NULL,
    "question_id" BIGINT NOT NULL,
    "status" "interview_progress_status" NOT NULL DEFAULT 'not_started',
    "practiced_at" TIMESTAMP(0),
    "completed_at" TIMESTAMP(0),

    CONSTRAINT "interview_progress_pkey" PRIMARY KEY ("student_user_id","question_id")
);

-- CreateTable
CREATE TABLE "interview_questions" (
    "question_id" BIGSERIAL NOT NULL,
    "category" "interview_questions_category" NOT NULL,
    "prompt" TEXT NOT NULL,
    "guidance" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "meeting_times" (
    "meeting_time_id" BIGSERIAL NOT NULL,
    "offering_id" BIGINT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,

    CONSTRAINT "meeting_times_pkey" PRIMARY KEY ("meeting_time_id")
);

-- CreateTable
CREATE TABLE "planned_courses" (
    "plan_id" BIGINT NOT NULL,
    "offering_id" BIGINT NOT NULL,
    "added_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planned_courses_pkey" PRIMARY KEY ("plan_id","offering_id")
);

-- CreateTable
CREATE TABLE "profile_interests" (
    "interest_id" BIGSERIAL NOT NULL,
    "student_user_id" BIGINT NOT NULL,
    "interest_name" VARCHAR(120) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profile_interests_pkey" PRIMARY KEY ("interest_id")
);

-- CreateTable
CREATE TABLE "profile_preferences" (
    "user_id" BIGINT NOT NULL,
    "preferred_start_time" TIME(0),
    "preferred_end_time" TIME(0),
    "schedule_notes" VARCHAR(255),
    "work_status" VARCHAR(60),

    CONSTRAINT "profile_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "program_courses" (
    "program_id" BIGINT NOT NULL,
    "course_id" BIGINT NOT NULL,
    "requirement_type" "program_courses_requirement_type" NOT NULL DEFAULT 'required',

    CONSTRAINT "program_courses_pkey" PRIMARY KEY ("program_id","course_id")
);

-- CreateTable
CREATE TABLE "programs" (
    "program_id" BIGSERIAL NOT NULL,
    "program_name" VARCHAR(160) NOT NULL,
    "degree_level" "programs_degree_level" NOT NULL,
    "description" TEXT,
    "required_credits" DECIMAL(5,1),
    "publication_status" "programs_publication_status" NOT NULL DEFAULT 'draft',

    CONSTRAINT "programs_pkey" PRIMARY KEY ("program_id")
);

-- CreateTable
CREATE TABLE "review_flags" (
    "flag_id" BIGSERIAL NOT NULL,
    "review_id" BIGINT NOT NULL,
    "reported_by_user_id" BIGINT,
    "reason" VARCHAR(255) NOT NULL,
    "status" "review_flags_status" NOT NULL DEFAULT 'open',
    "reviewer_user_id" BIGINT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision_at" TIMESTAMP(0),

    CONSTRAINT "review_flags_pkey" PRIMARY KEY ("flag_id")
);

-- CreateTable
CREATE TABLE "saved_steps" (
    "student_user_id" BIGINT NOT NULL,
    "opportunity_id" BIGINT NOT NULL,
    "saved_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(0),

    CONSTRAINT "saved_steps_pkey" PRIMARY KEY ("student_user_id","opportunity_id")
);

-- CreateTable
CREATE TABLE "semester_plans" (
    "plan_id" BIGSERIAL NOT NULL,
    "student_user_id" BIGINT NOT NULL,
    "term_id" BIGINT NOT NULL,
    "plan_name" VARCHAR(120) NOT NULL DEFAULT 'My Schedule',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "semester_plans_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "skills" (
    "skill_id" BIGSERIAL NOT NULL,
    "skill_name" VARCHAR(120) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("skill_id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "user_id" BIGINT NOT NULL,
    "preferred_name" VARCHAR(100),
    "program_id" BIGINT,
    "concentration_id" BIGINT,
    "student_status" VARCHAR(50),
    "academic_year" VARCHAR(40),
    "expected_graduation" DATE,
    "gpa" DECIMAL(4,2),
    "career_goal" TEXT,
    "recorded_completed_credits" DECIMAL(5,1),
    "recorded_required_credits" DECIMAL(5,1),

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "terms" (
    "term_id" BIGSERIAL NOT NULL,
    "term_name" VARCHAR(40) NOT NULL,
    "academic_year" INTEGER NOT NULL,
    "start_date" DATE,
    "end_date" DATE,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("term_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "university_email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "auth_provider" VARCHAR(50),
    "provider_subject" VARCHAR(255),
    "role" "users_role" NOT NULL,
    "account_status" "users_account_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_admin_audit_events_admin" ON "admin_audit_events"("admin_user_id");

-- CreateIndex
CREATE INDEX "ix_career_opportunities_course" ON "career_opportunities"("related_course_id");

-- CreateIndex
CREATE INDEX "ix_career_opportunities_skill" ON "career_opportunities"("related_skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_concentration_program_name" ON "concentrations"("program_id", "concentration_name");

-- CreateIndex
CREATE INDEX "ix_course_history_course" ON "course_history"("course_id");

-- CreateIndex
CREATE INDEX "ix_course_history_student" ON "course_history"("student_user_id");

-- CreateIndex
CREATE INDEX "ix_course_history_term" ON "course_history"("term_id");

-- CreateIndex
CREATE INDEX "ix_course_offerings_term" ON "course_offerings"("term_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_offering_section" ON "course_offerings"("course_id", "term_id", "section");

-- CreateIndex
CREATE INDEX "ix_course_prerequisites_required" ON "course_prerequisites"("prerequisite_course_id");

-- CreateIndex
CREATE INDEX "ix_course_reviews_course" ON "course_reviews"("course_id");

-- CreateIndex
CREATE INDEX "ix_course_reviews_student" ON "course_reviews"("student_user_id");

-- CreateIndex
CREATE INDEX "ix_course_skills_skill" ON "course_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_code" ON "courses"("course_code");

-- CreateIndex
CREATE INDEX "ix_interview_progress_question" ON "interview_progress"("question_id");

-- CreateIndex
CREATE INDEX "ix_meeting_times_offering" ON "meeting_times"("offering_id");

-- CreateIndex
CREATE INDEX "ix_planned_courses_offering" ON "planned_courses"("offering_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_student_interest" ON "profile_interests"("student_user_id", "interest_name");

-- CreateIndex
CREATE INDEX "ix_program_courses_course" ON "program_courses"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_programs_name_degree" ON "programs"("program_name", "degree_level");

-- CreateIndex
CREATE INDEX "ix_review_flags_reporter" ON "review_flags"("reported_by_user_id");

-- CreateIndex
CREATE INDEX "ix_review_flags_review" ON "review_flags"("review_id");

-- CreateIndex
CREATE INDEX "ix_review_flags_reviewer" ON "review_flags"("reviewer_user_id");

-- CreateIndex
CREATE INDEX "ix_saved_steps_opportunity" ON "saved_steps"("opportunity_id");

-- CreateIndex
CREATE INDEX "ix_semester_plans_student" ON "semester_plans"("student_user_id");

-- CreateIndex
CREATE INDEX "ix_semester_plans_term" ON "semester_plans"("term_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_name" ON "skills"("skill_name");

-- CreateIndex
CREATE INDEX "ix_student_profiles_concentration" ON "student_profiles"("concentration_id");

-- CreateIndex
CREATE INDEX "ix_student_profiles_program" ON "student_profiles"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_term_name_year" ON "terms"("term_name", "academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "university_email" ON "users"("university_email");

-- CreateIndex
CREATE UNIQUE INDEX "uq_users_provider_identity" ON "users"("auth_provider", "provider_subject");

-- AddForeignKey
ALTER TABLE "admin_audit_events" ADD CONSTRAINT "fk_admin_audit_events_admin" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "career_opportunities" ADD CONSTRAINT "fk_career_opportunities_course" FOREIGN KEY ("related_course_id") REFERENCES "courses"("course_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "career_opportunities" ADD CONSTRAINT "fk_career_opportunities_skill" FOREIGN KEY ("related_skill_id") REFERENCES "skills"("skill_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "concentrations" ADD CONSTRAINT "fk_concentrations_program" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_history" ADD CONSTRAINT "fk_course_history_course" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_history" ADD CONSTRAINT "fk_course_history_student" FOREIGN KEY ("student_user_id") REFERENCES "student_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_history" ADD CONSTRAINT "fk_course_history_term" FOREIGN KEY ("term_id") REFERENCES "terms"("term_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "fk_course_offerings_course" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "fk_course_offerings_term" FOREIGN KEY ("term_id") REFERENCES "terms"("term_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "fk_course_prerequisites_course" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "fk_course_prerequisites_required" FOREIGN KEY ("prerequisite_course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_reviews" ADD CONSTRAINT "fk_course_reviews_course" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_reviews" ADD CONSTRAINT "fk_course_reviews_student" FOREIGN KEY ("student_user_id") REFERENCES "student_profiles"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_skills" ADD CONSTRAINT "fk_course_skills_course" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_skills" ADD CONSTRAINT "fk_course_skills_skill" FOREIGN KEY ("skill_id") REFERENCES "skills"("skill_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "interview_progress" ADD CONSTRAINT "fk_interview_progress_question" FOREIGN KEY ("question_id") REFERENCES "interview_questions"("question_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "interview_progress" ADD CONSTRAINT "fk_interview_progress_student" FOREIGN KEY ("student_user_id") REFERENCES "student_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meeting_times" ADD CONSTRAINT "fk_meeting_times_offering" FOREIGN KEY ("offering_id") REFERENCES "course_offerings"("offering_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "planned_courses" ADD CONSTRAINT "fk_planned_courses_offering" FOREIGN KEY ("offering_id") REFERENCES "course_offerings"("offering_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "planned_courses" ADD CONSTRAINT "fk_planned_courses_plan" FOREIGN KEY ("plan_id") REFERENCES "semester_plans"("plan_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_interests" ADD CONSTRAINT "fk_profile_interests_student" FOREIGN KEY ("student_user_id") REFERENCES "student_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_preferences" ADD CONSTRAINT "fk_profile_preferences_student" FOREIGN KEY ("user_id") REFERENCES "student_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "program_courses" ADD CONSTRAINT "fk_program_courses_course" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "program_courses" ADD CONSTRAINT "fk_program_courses_program" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review_flags" ADD CONSTRAINT "fk_review_flags_reporter" FOREIGN KEY ("reported_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review_flags" ADD CONSTRAINT "fk_review_flags_review" FOREIGN KEY ("review_id") REFERENCES "course_reviews"("review_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review_flags" ADD CONSTRAINT "fk_review_flags_reviewer" FOREIGN KEY ("reviewer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saved_steps" ADD CONSTRAINT "fk_saved_steps_opportunity" FOREIGN KEY ("opportunity_id") REFERENCES "career_opportunities"("opportunity_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saved_steps" ADD CONSTRAINT "fk_saved_steps_student" FOREIGN KEY ("student_user_id") REFERENCES "student_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "semester_plans" ADD CONSTRAINT "fk_semester_plans_student" FOREIGN KEY ("student_user_id") REFERENCES "student_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "semester_plans" ADD CONSTRAINT "fk_semester_plans_term" FOREIGN KEY ("term_id") REFERENCES "terms"("term_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "fk_student_profiles_concentration" FOREIGN KEY ("concentration_id") REFERENCES "concentrations"("concentration_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "fk_student_profiles_program" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "fk_student_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Preserve nonnegative values from the legacy unsigned numeric fields.
ALTER TABLE "admin_audit_events" ADD CONSTRAINT "ck_admin_audit_events_event_id_nonnegative" CHECK ("event_id" >= 0);
ALTER TABLE "admin_audit_events" ADD CONSTRAINT "ck_admin_audit_events_admin_user_id_nonnegative" CHECK ("admin_user_id" >= 0);
ALTER TABLE "admin_audit_events" ADD CONSTRAINT "ck_admin_audit_events_entity_id_nonnegative" CHECK ("entity_id" >= 0);
ALTER TABLE "career_opportunities" ADD CONSTRAINT "ck_career_opportunities_opportunity_id_nonnegative" CHECK ("opportunity_id" >= 0);
ALTER TABLE "career_opportunities" ADD CONSTRAINT "ck_career_opportunities_related_course_id_nonnegative" CHECK ("related_course_id" >= 0);
ALTER TABLE "career_opportunities" ADD CONSTRAINT "ck_career_opportunities_related_skill_id_nonnegative" CHECK ("related_skill_id" >= 0);
ALTER TABLE "concentrations" ADD CONSTRAINT "ck_concentrations_concentration_id_nonnegative" CHECK ("concentration_id" >= 0);
ALTER TABLE "concentrations" ADD CONSTRAINT "ck_concentrations_program_id_nonnegative" CHECK ("program_id" >= 0);
ALTER TABLE "course_history" ADD CONSTRAINT "ck_course_history_history_id_nonnegative" CHECK ("history_id" >= 0);
ALTER TABLE "course_history" ADD CONSTRAINT "ck_course_history_student_user_id_nonnegative" CHECK ("student_user_id" >= 0);
ALTER TABLE "course_history" ADD CONSTRAINT "ck_course_history_course_id_nonnegative" CHECK ("course_id" >= 0);
ALTER TABLE "course_history" ADD CONSTRAINT "ck_course_history_term_id_nonnegative" CHECK ("term_id" >= 0);
ALTER TABLE "course_offerings" ADD CONSTRAINT "ck_course_offerings_offering_id_nonnegative" CHECK ("offering_id" >= 0);
ALTER TABLE "course_offerings" ADD CONSTRAINT "ck_course_offerings_course_id_nonnegative" CHECK ("course_id" >= 0);
ALTER TABLE "course_offerings" ADD CONSTRAINT "ck_course_offerings_term_id_nonnegative" CHECK ("term_id" >= 0);
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "ck_course_prerequisites_course_id_nonnegative" CHECK ("course_id" >= 0);
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "ck_course_prerequisites_prerequisite_course_id_nonnegative" CHECK ("prerequisite_course_id" >= 0);
ALTER TABLE "course_reviews" ADD CONSTRAINT "ck_course_reviews_review_id_nonnegative" CHECK ("review_id" >= 0);
ALTER TABLE "course_reviews" ADD CONSTRAINT "ck_course_reviews_course_id_nonnegative" CHECK ("course_id" >= 0);
ALTER TABLE "course_reviews" ADD CONSTRAINT "ck_course_reviews_student_user_id_nonnegative" CHECK ("student_user_id" >= 0);
ALTER TABLE "course_reviews" ADD CONSTRAINT "ck_course_reviews_rating_nonnegative" CHECK ("rating" >= 0);
ALTER TABLE "course_skills" ADD CONSTRAINT "ck_course_skills_course_id_nonnegative" CHECK ("course_id" >= 0);
ALTER TABLE "course_skills" ADD CONSTRAINT "ck_course_skills_skill_id_nonnegative" CHECK ("skill_id" >= 0);
ALTER TABLE "courses" ADD CONSTRAINT "ck_courses_course_id_nonnegative" CHECK ("course_id" >= 0);
ALTER TABLE "interview_progress" ADD CONSTRAINT "ck_interview_progress_student_user_id_nonnegative" CHECK ("student_user_id" >= 0);
ALTER TABLE "interview_progress" ADD CONSTRAINT "ck_interview_progress_question_id_nonnegative" CHECK ("question_id" >= 0);
ALTER TABLE "interview_questions" ADD CONSTRAINT "ck_interview_questions_question_id_nonnegative" CHECK ("question_id" >= 0);
ALTER TABLE "interview_questions" ADD CONSTRAINT "ck_interview_questions_display_order_nonnegative" CHECK ("display_order" >= 0);
ALTER TABLE "meeting_times" ADD CONSTRAINT "ck_meeting_times_meeting_time_id_nonnegative" CHECK ("meeting_time_id" >= 0);
ALTER TABLE "meeting_times" ADD CONSTRAINT "ck_meeting_times_offering_id_nonnegative" CHECK ("offering_id" >= 0);
ALTER TABLE "meeting_times" ADD CONSTRAINT "ck_meeting_times_weekday_nonnegative" CHECK ("weekday" >= 0);
ALTER TABLE "planned_courses" ADD CONSTRAINT "ck_planned_courses_plan_id_nonnegative" CHECK ("plan_id" >= 0);
ALTER TABLE "planned_courses" ADD CONSTRAINT "ck_planned_courses_offering_id_nonnegative" CHECK ("offering_id" >= 0);
ALTER TABLE "profile_interests" ADD CONSTRAINT "ck_profile_interests_interest_id_nonnegative" CHECK ("interest_id" >= 0);
ALTER TABLE "profile_interests" ADD CONSTRAINT "ck_profile_interests_student_user_id_nonnegative" CHECK ("student_user_id" >= 0);
ALTER TABLE "profile_interests" ADD CONSTRAINT "ck_profile_interests_display_order_nonnegative" CHECK ("display_order" >= 0);
ALTER TABLE "profile_preferences" ADD CONSTRAINT "ck_profile_preferences_user_id_nonnegative" CHECK ("user_id" >= 0);
ALTER TABLE "program_courses" ADD CONSTRAINT "ck_program_courses_program_id_nonnegative" CHECK ("program_id" >= 0);
ALTER TABLE "program_courses" ADD CONSTRAINT "ck_program_courses_course_id_nonnegative" CHECK ("course_id" >= 0);
ALTER TABLE "programs" ADD CONSTRAINT "ck_programs_program_id_nonnegative" CHECK ("program_id" >= 0);
ALTER TABLE "review_flags" ADD CONSTRAINT "ck_review_flags_flag_id_nonnegative" CHECK ("flag_id" >= 0);
ALTER TABLE "review_flags" ADD CONSTRAINT "ck_review_flags_review_id_nonnegative" CHECK ("review_id" >= 0);
ALTER TABLE "review_flags" ADD CONSTRAINT "ck_review_flags_reported_by_user_id_nonnegative" CHECK ("reported_by_user_id" >= 0);
ALTER TABLE "review_flags" ADD CONSTRAINT "ck_review_flags_reviewer_user_id_nonnegative" CHECK ("reviewer_user_id" >= 0);
ALTER TABLE "saved_steps" ADD CONSTRAINT "ck_saved_steps_student_user_id_nonnegative" CHECK ("student_user_id" >= 0);
ALTER TABLE "saved_steps" ADD CONSTRAINT "ck_saved_steps_opportunity_id_nonnegative" CHECK ("opportunity_id" >= 0);
ALTER TABLE "semester_plans" ADD CONSTRAINT "ck_semester_plans_plan_id_nonnegative" CHECK ("plan_id" >= 0);
ALTER TABLE "semester_plans" ADD CONSTRAINT "ck_semester_plans_student_user_id_nonnegative" CHECK ("student_user_id" >= 0);
ALTER TABLE "semester_plans" ADD CONSTRAINT "ck_semester_plans_term_id_nonnegative" CHECK ("term_id" >= 0);
ALTER TABLE "skills" ADD CONSTRAINT "ck_skills_skill_id_nonnegative" CHECK ("skill_id" >= 0);
ALTER TABLE "student_profiles" ADD CONSTRAINT "ck_student_profiles_user_id_nonnegative" CHECK ("user_id" >= 0);
ALTER TABLE "student_profiles" ADD CONSTRAINT "ck_student_profiles_program_id_nonnegative" CHECK ("program_id" >= 0);
ALTER TABLE "student_profiles" ADD CONSTRAINT "ck_student_profiles_concentration_id_nonnegative" CHECK ("concentration_id" >= 0);
ALTER TABLE "terms" ADD CONSTRAINT "ck_terms_term_id_nonnegative" CHECK ("term_id" >= 0);
ALTER TABLE "terms" ADD CONSTRAINT "ck_terms_academic_year_nonnegative" CHECK ("academic_year" >= 0);
ALTER TABLE "users" ADD CONSTRAINT "ck_users_id_nonnegative" CHECK ("id" >= 0);
ALTER TABLE "courses" ADD CONSTRAINT "ck_courses_credits" CHECK (credits >= 0);
ALTER TABLE "course_history" ADD CONSTRAINT "ck_history_credits" CHECK (earned_credits >= 0);
ALTER TABLE "course_reviews" ADD CONSTRAINT "ck_course_review_rating" CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE "meeting_times" ADD CONSTRAINT "ck_meeting_weekday" CHECK (weekday BETWEEN 1 AND 7);
ALTER TABLE "meeting_times" ADD CONSTRAINT "ck_meeting_time_order" CHECK (start_time < end_time);
ALTER TABLE "terms" ADD CONSTRAINT "ck_term_date_order" CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date);

-- Preserve database-side update timestamps, including updates outside Prisma.
CREATE FUNCTION touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_semester_plans_updated_at BEFORE UPDATE ON "semester_plans" FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_course_reviews_updated_at BEFORE UPDATE ON "course_reviews" FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
