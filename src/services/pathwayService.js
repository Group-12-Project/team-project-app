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

  const eligible = (requiredCourses || []).filter((course) => {
    if (completedSet.has(normalizeCourseCode(course.code))) return false;
    const prereqs = ensureArray(course.prerequisites || []);
    return prereqs.every((prereq) => completedSet.has(normalizeCourseCode(prereq)));
  });

  return eligible.slice(0, limit).map((course) => ({
    code: course.code,
    title: course.title,
    credits: course.credits,
    category: course.category,
  }));
}

/**
 * Schedule prerequisites in earlier semesters, preserving catalog order among
 * eligible courses. Courses blocked by missing/cyclic prerequisites or by the
 * credit cap remain unscheduled; an empty semester is never emitted.
 */
function generateSemesterPlan({ completedCourses = [], requiredCourses = defaultCourses, creditsPerSemester = 9 }) {
  const creditCap = Number(creditsPerSemester);
  if (!Number.isFinite(creditCap) || creditCap <= 0) {
    throw new RangeError('creditsPerSemester must be a positive finite number');
  }

  const completedSet = new Set(ensureArray(completedCourses).map(normalizeCourseCode));
  let remaining = (requiredCourses || []).filter((course) => !completedSet.has(normalizeCourseCode(course.code)));
  const plan = [];

  while (remaining.length > 0) {
    const courses = [];
    let credits = 0;

    for (const course of remaining) {
      const courseCredits = Number(course.credits || 0);
      const prereqsMet = ensureArray(course.prerequisites).every((prereq) =>
        completedSet.has(normalizeCourseCode(prereq)),
      );
      if (prereqsMet && Number.isFinite(courseCredits) && courseCredits >= 0 && credits + courseCredits <= creditCap) {
        courses.push(course);
        credits += courseCredits;
      }
    }

    if (courses.length === 0) break;

    plan.push({
      semester: plan.length + 1,
      courses: courses.map(({ code, title, credits, category }) => ({ code, title, credits, category })),
      credits,
    });
    // Only a completed semester can satisfy prerequisites for the next one.
    for (const course of courses) completedSet.add(normalizeCourseCode(course.code));
    remaining = remaining.filter((course) => !completedSet.has(normalizeCourseCode(course.code)));
  }

  return plan;
}

export {
  defaultCourses,
  calculateProgress,
  getNextCourses,
  generateSemesterPlan,
  normalizeCourseCode,
};
