/**
 * GradPath — profile data contract + fictional sample data
 * ---------------------------------------------------------
 * This file is the single source of truth for the SHAPE of a profile.
 * All sample data is fictional. No real student data lives here.
 *
 * Profile contract (draft — confirm with Ian before implementing storage):
 *
 *   fullName            string   required   (editable)
 *   preferredName       string   optional   (editable)
 *   currentYear         string   required   student status, e.g. "Senior"   (editable)
 *   major               string   required   degree program                   (editable)
 *   concentration       string   optional   specialization                  (editable)
 *   expectedGraduation  string   required   e.g. "May 2027"                 (editable)
 *   gpa                 number   optional   0–4.0                            (editable)
 *   careerGoal          string   optional   (editable)
 *   interests           string[] optional   (editable)
 *   schedulePreferences { timeOfDay: string, workStatus: string }  optional  (editable, own page later)
 *   credits             { completed: number, required: number }    required  OFFICIAL / read-only
 *   courseHistory       { code, title, term, credits, grade }[]    optional  OFFICIAL / read-only
 */
(function (global) {
  const SAMPLE_PROFILE = {
    fullName: 'James Peterson',
    preferredName: 'James',
    currentYear: 'Senior',
    major: 'Computer Science',
    concentration: 'Software Engineering',
    expectedGraduation: 'May 2027',
    gpa: 3.4,
    careerGoal: 'Software engineer',
    interests: ['Databases', 'Web development'],
    schedulePreferences: { timeOfDay: 'Morning classes', workStatus: 'Part-time' },
    credits: { completed: 93, required: 120 },
    courseHistory: [
      { code: 'CS 101', title: 'Introduction to Programming', term: 'Fall 2023', credits: 3, grade: 'A' },
      { code: 'CS 201', title: 'Data Structures', term: 'Spring 2024', credits: 3, grade: 'B+' },
      { code: 'CS 250', title: 'Computer Systems', term: 'Fall 2024', credits: 3, grade: 'A-' },
      { code: 'MATH 230', title: 'Discrete Mathematics', term: 'Spring 2025', credits: 3, grade: 'B' }
    ]
  };

  // Only the required fields — used to check that every optional section has an empty state.
  const SAMPLE_PROFILE_MINIMAL = {
    fullName: 'Alex Rivera',
    currentYear: 'Junior',
    major: 'Computer Science',
    expectedGraduation: 'May 2028',
    credits: { completed: 60, required: 120 }
  };

  global.GradPathSampleProfile = SAMPLE_PROFILE;
  global.GradPathSampleProfileMinimal = SAMPLE_PROFILE_MINIMAL;
})(window);
