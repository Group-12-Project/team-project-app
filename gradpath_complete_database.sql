CREATE DATABASE  IF NOT EXISTS `gradplanner` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `gradplanner`;
-- MySQL dump 10.13  Distrib 8.0.46, for macos15 (arm64)
--
-- Host: localhost    Database: gradplanner
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_audit_events`
--

DROP TABLE IF EXISTS `admin_audit_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_audit_events` (
  `event_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `admin_user_id` bigint unsigned NOT NULL,
  `action_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` bigint unsigned DEFAULT NULL COMMENT 'Polymorphic identifier; not a foreign key',
  `action_details` text COLLATE utf8mb4_unicode_ci,
  `event_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  KEY `fk_admin_audit_events_admin` (`admin_user_id`),
  CONSTRAINT `fk_admin_audit_events_admin` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `advisor_assignments`
--

DROP TABLE IF EXISTS `advisor_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advisor_assignments` (
  `advisor_user_id` bigint unsigned NOT NULL,
  `student_user_id` bigint unsigned NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  PRIMARY KEY (`advisor_user_id`,`student_user_id`),
  KEY `idx_advisor_assignments_student` (`student_user_id`),
  CONSTRAINT `fk_advisor_assignments_advisor` FOREIGN KEY (`advisor_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_advisor_assignments_student` FOREIGN KEY (`student_user_id`) REFERENCES `student_profiles` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `ck_advisor_assignment_dates` CHECK (((`ended_at` is null) or (`ended_at` >= `assigned_at`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `career_opportunities`
--

DROP TABLE IF EXISTS `career_opportunities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `career_opportunities` (
  `opportunity_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category` enum('club_organization','skill_course','internship') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `why_it_helps` text COLLATE utf8mb4_unicode_ci,
  `next_action` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_course_id` bigint unsigned DEFAULT NULL,
  `related_skill_id` bigint unsigned DEFAULT NULL,
  `publication_status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`opportunity_id`),
  KEY `fk_career_opportunities_course` (`related_course_id`),
  KEY `fk_career_opportunities_skill` (`related_skill_id`),
  CONSTRAINT `fk_career_opportunities_course` FOREIGN KEY (`related_course_id`) REFERENCES `courses` (`course_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_career_opportunities_skill` FOREIGN KEY (`related_skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `concentrations`
--

DROP TABLE IF EXISTS `concentrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `concentrations` (
  `concentration_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `program_id` bigint unsigned NOT NULL,
  `concentration_name` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`concentration_id`),
  UNIQUE KEY `uq_concentration_program_name` (`program_id`,`concentration_name`),
  CONSTRAINT `fk_concentrations_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_history`
--

DROP TABLE IF EXISTS `course_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_history` (
  `history_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `student_user_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned DEFAULT NULL,
  `term_id` bigint unsigned DEFAULT NULL,
  `course_code_snapshot` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_title_snapshot` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `completion_status` enum('completed','in_progress','withdrawn','failed','transferred') COLLATE utf8mb4_unicode_ci NOT NULL,
  `earned_credits` decimal(4,1) NOT NULL DEFAULT '0.0',
  `grade` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`history_id`),
  KEY `fk_course_history_student` (`student_user_id`),
  KEY `fk_course_history_course` (`course_id`),
  KEY `fk_course_history_term` (`term_id`),
  CONSTRAINT `fk_course_history_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_course_history_student` FOREIGN KEY (`student_user_id`) REFERENCES `student_profiles` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_course_history_term` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE SET NULL,
  CONSTRAINT `ck_history_credits` CHECK ((`earned_credits` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_offerings`
--

DROP TABLE IF EXISTS `course_offerings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_offerings` (
  `offering_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `course_id` bigint unsigned NOT NULL,
  `term_id` bigint unsigned NOT NULL,
  `section` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `delivery_mode` enum('in_person','online','hybrid','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in_person',
  PRIMARY KEY (`offering_id`),
  UNIQUE KEY `uq_offering_section` (`course_id`,`term_id`,`section`),
  KEY `fk_course_offerings_term` (`term_id`),
  CONSTRAINT `fk_course_offerings_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_course_offerings_term` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_prerequisites`
--

DROP TABLE IF EXISTS `course_prerequisites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_prerequisites` (
  `course_id` bigint unsigned NOT NULL,
  `prerequisite_course_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`course_id`,`prerequisite_course_id`),
  KEY `fk_course_prerequisites_required` (`prerequisite_course_id`),
  CONSTRAINT `fk_course_prerequisites_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_course_prerequisites_required` FOREIGN KEY (`prerequisite_course_id`) REFERENCES `courses` (`course_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_reviews`
--

DROP TABLE IF EXISTS `course_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_reviews` (
  `review_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `course_id` bigint unsigned NOT NULL,
  `student_user_id` bigint unsigned NOT NULL,
  `rating` tinyint unsigned NOT NULL,
  `review_text` text COLLATE utf8mb4_unicode_ci,
  `moderation_status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `fk_course_reviews_course` (`course_id`),
  KEY `fk_course_reviews_student` (`student_user_id`),
  CONSTRAINT `fk_course_reviews_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_course_reviews_student` FOREIGN KEY (`student_user_id`) REFERENCES `student_profiles` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `ck_course_review_rating` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_skills`
--

DROP TABLE IF EXISTS `course_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_skills` (
  `course_id` bigint unsigned NOT NULL,
  `skill_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`course_id`,`skill_id`),
  KEY `fk_course_skills_skill` (`skill_id`),
  CONSTRAINT `fk_course_skills_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_course_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `course_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `course_code` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credits` decimal(4,1) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `learning_outcomes` text COLLATE utf8mb4_unicode_ci,
  `publication_status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `course_code` (`course_code`),
  CONSTRAINT `ck_courses_credits` CHECK ((`credits` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interview_progress`
--

DROP TABLE IF EXISTS `interview_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interview_progress` (
  `student_user_id` bigint unsigned NOT NULL,
  `question_id` bigint unsigned NOT NULL,
  `status` enum('not_started','practiced','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_started',
  `practiced_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`student_user_id`,`question_id`),
  KEY `fk_interview_progress_question` (`question_id`),
  CONSTRAINT `fk_interview_progress_question` FOREIGN KEY (`question_id`) REFERENCES `interview_questions` (`question_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_interview_progress_student` FOREIGN KEY (`student_user_id`) REFERENCES `student_profiles` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interview_questions`
--

DROP TABLE IF EXISTS `interview_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interview_questions` (
  `question_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category` enum('behavioral','technical') COLLATE utf8mb4_unicode_ci NOT NULL,
  `prompt` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `guidance` text COLLATE utf8mb4_unicode_ci,
  `display_order` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `meeting_times`
--

DROP TABLE IF EXISTS `meeting_times`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meeting_times` (
  `meeting_time_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `offering_id` bigint unsigned NOT NULL,
  `weekday` tinyint unsigned NOT NULL COMMENT '1=Monday, 7=Sunday',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`meeting_time_id`),
  KEY `fk_meeting_times_offering` (`offering_id`),
  CONSTRAINT `fk_meeting_times_offering` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE CASCADE,
  CONSTRAINT `ck_meeting_time_order` CHECK ((`start_time` < `end_time`)),
  CONSTRAINT `ck_meeting_weekday` CHECK ((`weekday` between 1 and 7))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `planned_courses`
--

DROP TABLE IF EXISTS `planned_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planned_courses` (
  `plan_id` bigint unsigned NOT NULL,
  `offering_id` bigint unsigned NOT NULL,
  `added_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`plan_id`,`offering_id`),
  KEY `fk_planned_courses_offering` (`offering_id`),
  CONSTRAINT `fk_planned_courses_offering` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`offering_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_planned_courses_plan` FOREIGN KEY (`plan_id`) REFERENCES `semester_plans` (`plan_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profile_interests`
--

DROP TABLE IF EXISTS `profile_interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile_interests` (
  `interest_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `student_user_id` bigint unsigned NOT NULL,
  `interest_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` smallint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`interest_id`),
  UNIQUE KEY `uq_student_interest` (`student_user_id`,`interest_name`),
  CONSTRAINT `fk_profile_interests_student` FOREIGN KEY (`student_user_id`) REFERENCES `student_profiles` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profile_preferences`
--

DROP TABLE IF EXISTS `profile_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile_preferences` (
  `user_id` bigint unsigned NOT NULL,
  `preferred_start_time` time DEFAULT NULL,
  `preferred_end_time` time DEFAULT NULL,
  `schedule_notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_status` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_profile_preferences_student` FOREIGN KEY (`user_id`) REFERENCES `student_profiles` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `program_courses`
--

DROP TABLE IF EXISTS `program_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_courses` (
  `program_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned NOT NULL,
  `requirement_type` enum('required','elective') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'required',
  PRIMARY KEY (`program_id`,`course_id`),
  KEY `fk_program_courses_course` (`course_id`),
  CONSTRAINT `fk_program_courses_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_program_courses_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `program_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `program_name` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `degree_level` enum('bachelors','masters','doctorate','certificate','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `required_credits` decimal(5,1) DEFAULT NULL,
  `publication_status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`program_id`),
  UNIQUE KEY `uq_programs_name_degree` (`program_name`,`degree_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review_flags`
--

DROP TABLE IF EXISTS `review_flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_flags` (
  `flag_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `review_id` bigint unsigned NOT NULL,
  `reported_by_user_id` bigint unsigned DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('open','under_review','resolved','dismissed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `reviewer_user_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `decision_at` datetime DEFAULT NULL,
  PRIMARY KEY (`flag_id`),
  KEY `fk_review_flags_review` (`review_id`),
  KEY `fk_review_flags_reporter` (`reported_by_user_id`),
  KEY `fk_review_flags_reviewer` (`reviewer_user_id`),
  CONSTRAINT `fk_review_flags_reporter` FOREIGN KEY (`reported_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_review_flags_review` FOREIGN KEY (`review_id`) REFERENCES `course_reviews` (`review_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_flags_reviewer` FOREIGN KEY (`reviewer_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `saved_steps`
--

DROP TABLE IF EXISTS `saved_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_steps` (
  `student_user_id` bigint unsigned NOT NULL,
  `opportunity_id` bigint unsigned NOT NULL,
  `saved_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`student_user_id`,`opportunity_id`),
  KEY `fk_saved_steps_opportunity` (`opportunity_id`),
  CONSTRAINT `fk_saved_steps_opportunity` FOREIGN KEY (`opportunity_id`) REFERENCES `career_opportunities` (`opportunity_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_saved_steps_student` FOREIGN KEY (`student_user_id`) REFERENCES `student_profiles` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `semester_plans`
--

DROP TABLE IF EXISTS `semester_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semester_plans` (
  `plan_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `student_user_id` bigint unsigned NOT NULL,
  `term_id` bigint unsigned NOT NULL,
  `plan_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'My Schedule',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`plan_id`),
  KEY `fk_semester_plans_student` (`student_user_id`),
  KEY `fk_semester_plans_term` (`term_id`),
  CONSTRAINT `fk_semester_plans_student` FOREIGN KEY (`student_user_id`) REFERENCES `student_profiles` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_semester_plans_term` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `skill_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `skill_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`skill_id`),
  UNIQUE KEY `skill_name` (`skill_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profiles` (
  `user_id` bigint unsigned NOT NULL,
  `preferred_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `program_id` bigint unsigned DEFAULT NULL,
  `concentration_id` bigint unsigned DEFAULT NULL,
  `student_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_education_level` enum('undergraduate','graduate','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attendance_type` enum('traditional','non_traditional') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academic_year` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expected_graduation` date DEFAULT NULL,
  `gpa` decimal(4,2) DEFAULT NULL,
  `career_goal` text COLLATE utf8mb4_unicode_ci,
  `recorded_completed_credits` decimal(5,1) DEFAULT NULL COMMENT 'Only when authoritative; otherwise derive from course_history',
  `recorded_required_credits` decimal(5,1) DEFAULT NULL COMMENT 'Only when authoritative; otherwise derive from program',
  PRIMARY KEY (`user_id`),
  KEY `fk_student_profiles_program` (`program_id`),
  KEY `fk_student_profiles_concentration` (`concentration_id`),
  CONSTRAINT `fk_student_profiles_concentration` FOREIGN KEY (`concentration_id`) REFERENCES `concentrations` (`concentration_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_student_profiles_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_student_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `terms`
--

DROP TABLE IF EXISTS `terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `terms` (
  `term_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `term_name` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year` smallint unsigned NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`term_id`),
  UNIQUE KEY `uq_term_name_year` (`term_name`,`academic_year`),
  CONSTRAINT `ck_term_date_order` CHECK (((`start_date` is null) or (`end_date` is null) or (`start_date` <= `end_date`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `university_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NULL when using external identity provider',
  `auth_provider` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('student','advisor','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_status` enum('pending','active','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `university_email` (`university_email`),
  UNIQUE KEY `uq_users_provider_identity` (`auth_provider`,`provider_subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `weekly_time_preferences`
--

DROP TABLE IF EXISTS `weekly_time_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weekly_time_preferences` (
  `time_preference_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `student_user_id` bigint unsigned NOT NULL,
  `weekday` tinyint unsigned NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `preference_type` enum('preferred_class','work','unavailable') COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`time_preference_id`),
  KEY `idx_weekly_prefs_student_day` (`student_user_id`,`weekday`),
  CONSTRAINT `fk_weekly_time_preferences_student` FOREIGN KEY (`student_user_id`) REFERENCES `student_profiles` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `ck_weekly_prefs_time` CHECK ((`start_time` < `end_time`)),
  CONSTRAINT `ck_weekly_prefs_weekday` CHECK ((`weekday` between 1 and 7))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-08 14:29:39
