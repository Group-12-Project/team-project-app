'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { demo } = require('./helpers/demo');

function signedIn(options) { const d = demo(options); d.signIn(); return d; }

test('career hub shows the goal from the profile and links to each area', () => {
  const d = signedIn();
  d.route('career');
  assert.match(d.app.innerHTML, /Career Readiness/);
  assert.match(d.app.innerHTML, /Software engineer/);
  for (const route of ['career-clubs', 'career-skills', 'career-internships', 'interview/1', 'career-plan', 'profile-edit']) {
    assert.ok(d.app.innerHTML.includes(`href="#${route}"`), `hub links to ${route}`);
  }
});

test('club, skill, and internship lists open their detail pages', () => {
  const d = signedIn();
  d.route('career-clubs');
  assert.match(d.app.innerHTML, /Computing club/);
  assert.match(d.app.innerHTML, /Other ways to get involved/);
  d.route('career-skills');
  assert.match(d.app.innerHTML, /Turn a skill into evidence/);
  d.route('career-internships');
  assert.match(d.app.innerHTML, /Prepare before applying/);
  d.route('skill-detail/database-systems');
  assert.match(d.app.innerHTML, /Why it helps/);
  assert.match(d.app.innerHTML, /Review class details/);
  d.route('club-detail/nope');
  assert.match(d.app.innerHTML, /Opportunity not found/);
});

test('next steps start empty, then save, complete, reopen, and remove', () => {
  const d = signedIn();
  d.route('career-plan');
  assert.match(d.app.innerHTML, /No saved opportunities yet/);

  d.route('club-detail/computing-club');
  d.click('career-save', { id: 'computing-club' });
  assert.match(d.app.innerHTML, /Opportunity saved/);
  assert.match(d.app.innerHTML, /Added to My next steps/);

  d.route('club-detail/computing-club');
  assert.match(d.app.innerHTML, /Saved to my next steps/);

  d.route('career-plan');
  assert.match(d.app.innerHTML, /To do/);
  d.click('career-complete', { id: 'computing-club' });
  assert.match(d.app.innerHTML, /Step completed/);

  d.route('career-plan');
  assert.match(d.app.innerHTML, /Completed/);
  d.click('career-todo', { id: 'computing-club' });
  assert.match(d.app.innerHTML, /To do/);
  d.click('career-remove', { id: 'computing-club' });
  assert.match(d.app.innerHTML, /No saved opportunities yet/);
});

test('malformed saved steps are ignored', () => {
  const d = demo();
  d.localStorage.setItem('gradpath.nextsteps', '[{"id":"nope"}, 5, {"id":"computing-club","done":"yes"}]');
  d.signIn();
  d.route('career-plan');
  assert.match(d.app.innerHTML, /Computing club/);
  assert.match(d.app.innerHTML, /To do/);
});

test('interview practice walks through both questions', () => {
  const d = signedIn();
  d.route('interview/1');
  assert.match(d.app.innerHTML, /Question 1 of 2 · Behavioral/);
  assert.match(d.app.innerHTML, /Plan your answer with STAR/);

  d.click('interview-practiced', { n: '1' });
  assert.match(d.app.innerHTML, /Answer practiced/);
  assert.match(d.app.innerHTML, /First question completed/);

  d.route('interview/2');
  assert.match(d.app.innerHTML, /Question 2 of 2 · Technical/);
  assert.match(d.app.innerHTML, /Previous question/);

  d.click('interview-practiced', { n: '2' });
  assert.match(d.app.innerHTML, /Practice complete/);
  assert.match(d.app.innerHTML, /You practiced 2 interview questions/);

  d.click('interview-reset');
  assert.match(d.app.innerHTML, /Question 1 of 2/);
});

test('interview tips return to the question you were on', () => {
  const d = signedIn();
  d.route('interview/2');
  d.route('interview-tips');
  assert.match(d.app.innerHTML, /Before the interview/);
  assert.match(d.app.innerHTML, /href="#interview\/2"/);
});

test('sidebar highlights Career Readiness on career and interview pages', () => {
  const d = signedIn();
  for (const route of ['career', 'career-plan', 'interview/1', 'club-detail/computing-club']) {
    d.route(route);
    assert.match(d.app.innerHTML, /href="#career"[^>]*>|<a class="button active"[^>]*href="#career"/);
    assert.match(d.app.innerHTML, /class="button active" aria-current="page" href="#career"/);
  }
});
