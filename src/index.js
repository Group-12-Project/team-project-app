#!/usr/bin/env node
'use strict';

const { defaultCourses, calculateProgress, getNextCourses, generateSemesterPlan } = require('./pathway');

function printUsage() {
  console.log('Usage: node src/index.js --completed GRA-501,GRA-530 --credits 9');
}

function parseArgs(argv) {
  const args = { completed: [], credits: 9 };

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--completed') {
      const next = argv[i + 1];
      if (next) {
        args.completed = next.split(',').map((item) => item.trim()).filter(Boolean);
        i += 1;
      }
    } else if (value === '--credits') {
      const next = argv[i + 1];
      if (next) {
        args.credits = Number(next) || 9;
        i += 1;
      }
    } else if (value === '--help' || value === '-h') {
      printUsage();
      process.exit(0);
    }
  }

  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const progress = calculateProgress({ completedCourses: args.completed, requiredCourses: defaultCourses });
  const recommendations = getNextCourses({ completedCourses: args.completed, requiredCourses: defaultCourses, limit: 3 });
  const plan = generateSemesterPlan({ completedCourses: args.completed, requiredCourses: defaultCourses, creditsPerSemester: args.credits });

  console.log('Graduate Student Pathway App');
  console.log(`Completed: ${progress.completed}/${progress.totalRequired} courses (${progress.percentage}%)`);
  console.log(`Remaining: ${progress.remaining.join(', ') || 'None'}`);
  console.log('Next recommended courses:');
  if (recommendations.length === 0) {
    console.log('  You have completed the pathway requirements.');
  } else {
    recommendations.forEach((course) => {
      console.log(`  - ${course.code} (${course.title}) - ${course.credits} credits`);
    });
  }

  console.log('Semester plan:');
  if (plan.length === 0) {
    console.log('  No remaining courses scheduled.');
  } else {
    plan.forEach((semester) => {
      console.log(`  Semester ${semester.semester}: ${semester.courses.map((course) => course.code).join(', ')} (${semester.credits} credits)`);
    });
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, parseArgs };
