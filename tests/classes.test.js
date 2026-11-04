'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { demo } = require('./helpers/demo');

function signedIn(options) { const d = demo(options); d.signIn(); return d; }

test('browse lists the catalog and shows classes already in the plan', () => {
  const d = signedIn();
  d.route('classes');
  assert.match(d.app.innerHTML, /Browse classes/);
  assert.match(d.app.innerHTML, /Database Systems/);
  assert.match(d.app.innerHTML, /Advanced Web Development/);
  assert.match(d.app.innerHTML, /Already in your spring plan/);
  assert.doesNotMatch(d.app.innerHTML, /Computing Ethics/, 'planned-only classes are not in the browse list');
});

test('search finds a class by skill, reports no results, and clears', () => {
  const d = signedIn();
  d.route('classes');
  d.submit('class-search', { q: 'sql' });
  assert.match(d.app.innerHTML, /Search results/);
  assert.match(d.app.innerHTML, /1 class matches your search/);
  assert.doesNotMatch(d.app.innerHTML, /Advanced Web Development/);
  assert.equal((d.app.innerHTML.match(/← Back/g) || []).length, 1, 'only one Back control in search mode');

  d.submit('class-search', { q: 'zzz' });
  assert.match(d.app.innerHTML, /No classes found/);
  assert.match(d.app.innerHTML, /Try a broader title or a skill such as SQL/);

  d.click('class-clear');
  assert.match(d.app.innerHTML, /Browse classes/);
  assert.match(d.app.innerHTML, /Advanced Web Development/);
});

test('search text is escaped', () => {
  const d = signedIn();
  d.route('classes');
  d.submit('class-search', { q: '<img src=x onerror=alert(1)>' });
  assert.doesNotMatch(d.app.innerHTML, /<img src=x/);
  assert.match(d.app.innerHTML, /&lt;img/);
});

test('technical skills filter marks the active button', () => {
  const d = signedIn();
  d.route('classes');
  d.click('class-filter', { value: 'technical' });
  assert.match(d.app.innerHTML, /data-value="technical" aria-pressed="true"/);
  assert.match(d.app.innerHTML, /data-value="all" aria-pressed="false"/);
});

test('class detail shows the add action; adding updates the plan and detail page', () => {
  const d = signedIn();
  d.route('class-detail/database-systems');
  assert.match(d.app.innerHTML, /Prerequisite completed\. No schedule conflict\./);
  assert.match(d.app.innerHTML, /Add to schedule/);
  d.click('add-class', { id: 'database-systems' });
  assert.match(d.app.innerHTML, /Class added/);
  assert.match(d.app.innerHTML, /Database Systems was added to your Spring 2027 plan/);
  assert.ok(JSON.parse(d.localStorage.getItem('gradpath.plan')).includes('database-systems'));
  d.route('class-detail/database-systems');
  assert.match(d.app.innerHTML, /already in your plan/);
  assert.doesNotMatch(d.app.innerHTML, /data-action="add-class"/);
});

test('class conflict is detected and blocks adding', () => {
  const d = signedIn();
  d.route('class-detail/advanced-web-development');
  assert.match(d.app.innerHTML, /overlaps with Computing Ethics on Tuesday and Thursday at 11:00 AM/);
  assert.match(d.app.innerHTML, /Find another class/);
  assert.doesNotMatch(d.app.innerHTML, /data-action="add-class"/);
  d.click('add-class', { id: 'advanced-web-development' });
  assert.equal(d.localStorage.getItem('gradpath.plan'), null, 'a conflicting class is never saved');
});

test('class-added for a class that is not planned falls back to the detail page', () => {
  const d = signedIn();
  d.route('class-added/database-systems');
  assert.match(d.app.innerHTML, /Add to schedule/);
  assert.doesNotMatch(d.app.innerHTML, /was added to your Spring 2027 plan/);
});

test('unknown class id shows a not-found page instead of crashing', () => {
  const d = signedIn();
  d.route('class-detail/does-not-exist');
  assert.match(d.app.innerHTML, /Class not found/);
});

test('malformed stored plan falls back to the default plan', () => {
  const d = demo();
  d.localStorage.setItem('gradpath.plan', '{not json');
  d.signIn();
  d.route('classes');
  assert.match(d.app.innerHTML, /Already in your spring plan/);
  d.localStorage.setItem('gradpath.plan', JSON.stringify(['nope', 7, 'database-systems']));
  d.route('class-detail/database-systems');
  assert.match(d.app.innerHTML, /already in your plan/, 'unknown ids are dropped, valid ids kept');
});

test('blocked browser storage does not break adding a class', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() {} };
  const d = signedIn({ localStorage: blocked });
  d.route('class-detail/database-systems');
  d.click('add-class', { id: 'database-systems' });
  assert.match(d.app.innerHTML, /Class added/);
});
