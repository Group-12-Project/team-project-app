'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { demo } = require('./helpers/demo');

function signedIn(options) { const d = demo(options); d.signIn(); return d; }

test('schedule shows planned classes by day with credits and the planning-only note', () => {
  const d = signedIn();
  d.route('schedule');
  assert.match(d.app.innerHTML, /My schedule/);
  assert.match(d.app.innerHTML, /Spring 2027 · 6 planned credits/);
  assert.match(d.app.innerHTML, /Software Engineering/);
  assert.match(d.app.innerHTML, /Computing Ethics/);
  assert.match(d.app.innerHTML, /No classes/, 'Friday has no classes');
  assert.match(d.app.innerHTML, /does not enroll you/);
  assert.match(d.app.innerHTML, /aria-current="page" href="#schedule"|href="#schedule"[^>]*aria-current="page"/, 'Schedule is highlighted in the nav');
});

test('adding a class updates the schedule and shows the up-to-date notice', () => {
  const d = signedIn();
  d.route('class-detail/database-systems');
  d.click('add-class', { id: 'database-systems' });
  d.route('schedule/updated');
  assert.match(d.app.innerHTML, /9 planned credits/);
  assert.match(d.app.innerHTML, /Your plan is up to date\./);
  assert.match(d.app.innerHTML, /Remove Database Systems/);
});

test('removing a class asks first, then updates the plan', () => {
  const d = signedIn();
  d.route('schedule-remove/computing-ethics');
  assert.match(d.app.innerHTML, /Remove this class\?/);
  assert.match(d.app.innerHTML, /Your university enrollment will not change/);
  d.click('remove-class', { id: 'computing-ethics' });
  assert.match(d.app.innerHTML, /3 planned credits/);
  assert.doesNotMatch(d.app.innerHTML, /Remove Computing Ethics/);
  // the class that was in conflict can now be added
  d.route('class-detail/advanced-web-development');
  assert.match(d.app.innerHTML, /data-action="add-class"/);
});

test('an empty plan and an unknown class are handled', () => {
  const d = signedIn();
  d.localStorage.setItem('gradpath.plan', '[]');
  d.route('schedule');
  assert.match(d.app.innerHTML, /No classes in your plan yet/);
  assert.match(d.app.innerHTML, /0 planned credits/);
  d.route('schedule-remove/database-systems');
  assert.match(d.app.innerHTML, /That class is not in your plan/);
});
