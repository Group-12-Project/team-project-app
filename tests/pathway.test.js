'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateProgress,
  getNextCourses,
  generateSemesterPlan,
  defaultCourses,
} = require('../src/pathway');

test('calculateProgress reports total course completion accurately', () => {
  const result = calculateProgress({
    completedCourses: ['GRA-501', 'GRA-530'],
    requiredCourses: defaultCourses,
  });

  assert.equal(result.totalRequired, 7);
  assert.equal(result.completed, 2);
  assert.equal(result.percentage, 29);
  assert.deepEqual(result.remaining.includes('GRA-510'), true);
});

test('getNextCourses recommends only courses whose prerequisites are satisfied', () => {
  const result = getNextCourses({
    completedCourses: ['GRA-501'],
    requiredCourses: defaultCourses,
    limit: 5,
  });

  assert.deepEqual(result.map((course) => course.code), ['GRA-510', 'GRA-520', 'GRA-530']);
});

test('generateSemesterPlan creates a realistic sequence for remaining courses', () => {
  const result = generateSemesterPlan({
    completedCourses: ['GRA-501', 'GRA-530'],
    requiredCourses: defaultCourses,
    creditsPerSemester: 6,
  });

  assert.equal(result[0].semester, 1);
  assert.ok(result[0].courses.some((course) => course.code === 'GRA-510'));
  assert.ok(result[0].courses.some((course) => course.code === 'GRA-520'));
  assert.ok(result[0].credits <= 6);
});
