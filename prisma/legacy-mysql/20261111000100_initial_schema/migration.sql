-- Baseline from gradplanner_full_database.sql; database selection belongs to DATABASE_URL.
-- ===========================================================
-- 1. ACCOUNTS, PROGRAMS & STUDENT PROFILES
-- ===========================================================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  university_email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL COMMENT 'NULL when using external identity provider',
  auth_provider VARCHAR(50) NULL,
  provider_subject VARCHAR(255) NULL,
  role ENUM('student','admin') NOT NULL,
  account_status ENUM('pending','active','suspended') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_provider_identity (auth_provider, provider_subject)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS programs (
  program_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  program_name VARCHAR(160) NOT NULL,
  degree_level ENUM('bachelors','masters','doctorate','certificate','other') NOT NULL,
  description TEXT NULL,
  required_credits DECIMAL(5,1) NULL,
  publication_status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  UNIQUE KEY uq_programs_name_degree (program_name, degree_level)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS concentrations (
  concentration_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  program_id BIGINT UNSIGNED NOT NULL,
  concentration_name VARCHAR(160) NOT NULL,
  UNIQUE KEY uq_concentration_program_name (program_id, concentration_name),
  CONSTRAINT fk_concentrations_program FOREIGN KEY (program_id)
    REFERENCES programs(program_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  preferred_name VARCHAR(100) NULL,
  program_id BIGINT UNSIGNED NULL,
  concentration_id BIGINT UNSIGNED NULL,
  student_status VARCHAR(50) NULL,
  academic_year VARCHAR(40) NULL,
  expected_graduation DATE NULL,
  gpa DECIMAL(4,2) NULL,
  career_goal TEXT NULL,
  recorded_completed_credits DECIMAL(5,1) NULL COMMENT 'Only when authoritative; otherwise derive from course_history',
  recorded_required_credits DECIMAL(5,1) NULL COMMENT 'Only when authoritative; otherwise derive from program',
  CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_profiles_program FOREIGN KEY (program_id)
    REFERENCES programs(program_id) ON DELETE RESTRICT,
  CONSTRAINT fk_student_profiles_concentration FOREIGN KEY (concentration_id)
    REFERENCES concentrations(concentration_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS profile_interests (
  interest_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_user_id BIGINT UNSIGNED NOT NULL,
  interest_name VARCHAR(120) NOT NULL,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_student_interest (student_user_id, interest_name),
  CONSTRAINT fk_profile_interests_student FOREIGN KEY (student_user_id)
    REFERENCES student_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS profile_preferences (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  preferred_start_time TIME NULL,
  preferred_end_time TIME NULL,
  schedule_notes VARCHAR(255) NULL,
  work_status VARCHAR(60) NULL,
  CONSTRAINT fk_profile_preferences_student FOREIGN KEY (user_id)
    REFERENCES student_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===========================================================
-- 2. COURSE CATALOG, PROGRAM REQUIREMENTS & SKILLS
-- ===========================================================
CREATE TABLE IF NOT EXISTS courses (
  course_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(30) NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  credits DECIMAL(4,1) NOT NULL,
  description TEXT NULL,
  learning_outcomes TEXT NULL,
  publication_status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  CONSTRAINT ck_courses_credits CHECK (credits >= 0)
) ENGINE=InnoDB;

-- Added junction table: a program needs a list of required/elective courses.
CREATE TABLE IF NOT EXISTS program_courses (
  program_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  requirement_type ENUM('required','elective') NOT NULL DEFAULT 'required',
  PRIMARY KEY (program_id, course_id),
  CONSTRAINT fk_program_courses_program FOREIGN KEY (program_id)
    REFERENCES programs(program_id) ON DELETE CASCADE,
  CONSTRAINT fk_program_courses_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS skills (
  skill_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  skill_name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_skills (
  course_id BIGINT UNSIGNED NOT NULL,
  skill_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (course_id, skill_id),
  CONSTRAINT fk_course_skills_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_course_skills_skill FOREIGN KEY (skill_id)
    REFERENCES skills(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_prerequisites (
  course_id BIGINT UNSIGNED NOT NULL,
  prerequisite_course_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (course_id, prerequisite_course_id),
  CONSTRAINT fk_course_prerequisites_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE RESTRICT,
  CONSTRAINT fk_course_prerequisites_required FOREIGN KEY (prerequisite_course_id)
    REFERENCES courses(course_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===========================================================
-- 3. TERMS, OFFERINGS, STUDENT HISTORY & PLANNING
-- ===========================================================
CREATE TABLE IF NOT EXISTS terms (
  term_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  term_name VARCHAR(40) NOT NULL,
  academic_year SMALLINT UNSIGNED NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  UNIQUE KEY uq_term_name_year (term_name, academic_year),
  CONSTRAINT ck_term_date_order CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_offerings (
  offering_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  term_id BIGINT UNSIGNED NOT NULL,
  section VARCHAR(30) NOT NULL,
  delivery_mode ENUM('in_person','online','hybrid','other') NOT NULL DEFAULT 'in_person',
  UNIQUE KEY uq_offering_section (course_id, term_id, section),
  CONSTRAINT fk_course_offerings_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE RESTRICT,
  CONSTRAINT fk_course_offerings_term FOREIGN KEY (term_id)
    REFERENCES terms(term_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS meeting_times (
  meeting_time_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offering_id BIGINT UNSIGNED NOT NULL,
  weekday TINYINT UNSIGNED NOT NULL COMMENT '1=Monday, 7=Sunday',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CONSTRAINT ck_meeting_weekday CHECK (weekday BETWEEN 1 AND 7),
  CONSTRAINT ck_meeting_time_order CHECK (start_time < end_time),
  CONSTRAINT fk_meeting_times_offering FOREIGN KEY (offering_id)
    REFERENCES course_offerings(offering_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_history (
  history_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NULL,
  term_id BIGINT UNSIGNED NULL,
  course_code_snapshot VARCHAR(30) NULL,
  course_title_snapshot VARCHAR(200) NULL,
  completion_status ENUM('completed','in_progress','withdrawn','failed','transferred') NOT NULL,
  earned_credits DECIMAL(4,1) NOT NULL DEFAULT 0,
  grade VARCHAR(10) NULL,
  CONSTRAINT ck_history_credits CHECK (earned_credits >= 0),
  CONSTRAINT fk_course_history_student FOREIGN KEY (student_user_id)
    REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_course_history_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE SET NULL,
  CONSTRAINT fk_course_history_term FOREIGN KEY (term_id)
    REFERENCES terms(term_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semester_plans (
  plan_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_user_id BIGINT UNSIGNED NOT NULL,
  term_id BIGINT UNSIGNED NOT NULL,
  plan_name VARCHAR(120) NOT NULL DEFAULT 'My Schedule',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_semester_plans_student FOREIGN KEY (student_user_id)
    REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_semester_plans_term FOREIGN KEY (term_id)
    REFERENCES terms(term_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS planned_courses (
  plan_id BIGINT UNSIGNED NOT NULL,
  offering_id BIGINT UNSIGNED NOT NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (plan_id, offering_id),
  CONSTRAINT fk_planned_courses_plan FOREIGN KEY (plan_id)
    REFERENCES semester_plans(plan_id) ON DELETE CASCADE,
  CONSTRAINT fk_planned_courses_offering FOREIGN KEY (offering_id)
    REFERENCES course_offerings(offering_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===========================================================
-- 4. REVIEWS, OPPORTUNITIES, INTERVIEW PRACTICE & ADMIN
-- ===========================================================
CREATE TABLE IF NOT EXISTS course_reviews (
  review_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  student_user_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  review_text TEXT NULL,
  moderation_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT ck_course_review_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_course_reviews_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE RESTRICT,
  CONSTRAINT fk_course_reviews_student FOREIGN KEY (student_user_id)
    REFERENCES student_profiles(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS career_opportunities (
  opportunity_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category ENUM('club_organization','skill_course','internship') NOT NULL,
  title VARCHAR(200) NOT NULL,
  summary TEXT NULL,
  why_it_helps TEXT NULL,
  next_action VARCHAR(255) NULL,
  related_course_id BIGINT UNSIGNED NULL,
  related_skill_id BIGINT UNSIGNED NULL,
  publication_status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  CONSTRAINT fk_career_opportunities_course FOREIGN KEY (related_course_id)
    REFERENCES courses(course_id) ON DELETE SET NULL,
  CONSTRAINT fk_career_opportunities_skill FOREIGN KEY (related_skill_id)
    REFERENCES skills(skill_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS saved_steps (
  student_user_id BIGINT UNSIGNED NOT NULL,
  opportunity_id BIGINT UNSIGNED NOT NULL,
  saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at DATETIME NULL,
  PRIMARY KEY (student_user_id, opportunity_id),
  CONSTRAINT fk_saved_steps_student FOREIGN KEY (student_user_id)
    REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_steps_opportunity FOREIGN KEY (opportunity_id)
    REFERENCES career_opportunities(opportunity_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS interview_questions (
  question_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category ENUM('behavioral','technical') NOT NULL,
  prompt TEXT NOT NULL,
  guidance TEXT NULL,
  display_order INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS interview_progress (
  student_user_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  status ENUM('not_started','practiced','completed') NOT NULL DEFAULT 'not_started',
  practiced_at DATETIME NULL,
  completed_at DATETIME NULL,
  PRIMARY KEY (student_user_id, question_id),
  CONSTRAINT fk_interview_progress_student FOREIGN KEY (student_user_id)
    REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_progress_question FOREIGN KEY (question_id)
    REFERENCES interview_questions(question_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS review_flags (
  flag_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  review_id BIGINT UNSIGNED NOT NULL,
  reported_by_user_id BIGINT UNSIGNED NULL,
  reason VARCHAR(255) NOT NULL,
  status ENUM('open','under_review','resolved','dismissed') NOT NULL DEFAULT 'open',
  reviewer_user_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decision_at DATETIME NULL,
  CONSTRAINT fk_review_flags_review FOREIGN KEY (review_id)
    REFERENCES course_reviews(review_id) ON DELETE CASCADE,
  CONSTRAINT fk_review_flags_reporter FOREIGN KEY (reported_by_user_id)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_review_flags_reviewer FOREIGN KEY (reviewer_user_id)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_audit_events (
  event_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  action_name VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NULL COMMENT 'Polymorphic identifier; not a foreign key',
  action_details TEXT NULL,
  event_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_audit_events_admin FOREIGN KEY (admin_user_id)
    REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
