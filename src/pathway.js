'use strict';

const defaultCourses = [
  { code: 'GRA-501', title: 'Research Methods', credits: 3, category: 'core', prerequisites: [] },
  { code: 'GRA-510', title: 'Graduate Seminar', credits: 1, category: 'core', prerequisites: ['GRA-501'] },
  { code: 'GRA-520', title: 'Statistics for Research', credits: 3, category: 'core', prerequisites: ['GRA-501'] },
  { code: 'GRA-530', title: 'Advanced Writing', credits: 2, category: 'elective', prerequisites: [] },
  { code: 'GRA-540', title: 'Applied Analytics', credits: 3, category: 'elective', prerequisites: ['GRA-520'] },
  { code: 'GRA-550', title: 'Thesis Proposal', credits: 2, category: 'milestone', prerequisites: ['GRA-510', 'GRA-520'] },
  { code: 'GRA-560', title: 'Thesis Research', credits: 6, category: 'milestone', prerequisites: ['GRA-550'] },
];

function normalizeCourseCode(code) {
  return String(code || '').trim().toUpperCase();
}

function buildCourseMap(courses) {
  return new Map((courses || []).map((course) => [normalizeCourseCode(course.code), course]));
}

function ensureArray(values) {
  if (!values) return [];
  return Array.isArray(values) ? values : [values];
}

function calculateProgress({ completedCourses = [], requiredCourses = defaultCourses }) {
  const completedSet = new Set(ensureArray(completedCourses).map(normalizeCourseCode));
  const required = Array.isArray(requiredCourses) ? requiredCourses : defaultCourses;
  const totalRequired = required.length;
  const completed = required.filter((course) => completedSet.has(normalizeCourseCode(course.code))).length;
  const remaining = required.filter((course) => !completedSet.has(normalizeCourseCode(course.code)));
  const percentage = totalRequired === 0 ? 100 : Math.round((completed / totalRequired) * 100);

  return {
    totalRequired,
    completed,
    remaining: remaining.map((course) => course.code),
    percentage,
  };
}

function getNextCourses({ completedCourses = [], requiredCourses = defaultCourses, limit = 3 }) {
  const completedSet = new Set(ensureArray(completedCourses).map(normalizeCourseCode));
  const courseMap = buildCourseMap(requiredCourses);

  const eligible = (requiredCourses || []).filter((course) => {
    if (completedSet.has(normalizeCourseCode(course.code))) return false;
    const prereqs = ensureArray(course.prerequisites || []);
    return prereqs.every((prereq) => {
      const code = normalizeCourseCode(prereq);
      if (completedSet.has(code)) return true;
      return courseMap.has(code) && completedSet.has(code);
    });
  });

  return eligible.slice(0, limit).map((course) => ({
    code: course.code,
    title: course.title,
    credits: course.credits,
    category: course.category,
  }));
}

function generateSemesterPlan({ completedCourses = [], requiredCourses = defaultCourses, creditsPerSemester = 9 }) {
  const completedSet = new Set(ensureArray(completedCourses).map(normalizeCourseCode));
  const remaining = (requiredCourses || []).filter((course) => !completedSet.has(normalizeCourseCode(course.code)));
  const plan = [];
  let currentSemester = [];
  let currentCredits = 0;

  for (const course of remaining) {
    const prereqs = ensureArray(course.prerequisites || []);
    const prereqsMet = prereqs.every((prereq) => completedSet.has(normalizeCourseCode(prereq)) || currentSemester.some((item) => normalizeCourseCode(item.code) === normalizeCourseCode(prereq)));

    if (!prereqsMet) {
      if (currentSemester.length > 0) {
        plan.push({ semester: plan.length + 1, courses: currentSemester, credits: currentCredits });
        currentSemester = [];
        currentCredits = 0;
      }
      continue;
    }

    if (currentCredits + Number(course.credits || 0) > creditsPerSemester) {
      plan.push({ semester: plan.length + 1, courses: currentSemester, credits: currentCredits });
      currentSemester = [];
      currentCredits = 0;
    }

    currentSemester.push(course);
    currentCredits += Number(course.credits || 0);
  }

  if (currentSemester.length > 0) {
    plan.push({ semester: plan.length + 1, courses: currentSemester, credits: currentCredits });
  }

  return plan.map((semester) => ({
    ...semester,
    courses: semester.courses.map((course) => ({
      code: course.code,
      title: course.title,
      credits: course.credits,
      category: course.category,
    })),
  }));
}

module.exports = {
  defaultCourses,
  calculateProgress,
  getNextCourses,
  generateSemesterPlan,
  normalizeCourseCode,
};
